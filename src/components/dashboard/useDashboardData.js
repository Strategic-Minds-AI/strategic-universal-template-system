import { useEffect, useState, useRef, useCallback } from "react";
import { base44 } from "@/api/base44Client";

// Ceiling dashboard hook: real-time entity subscriptions + aggregate time-series + AI insights.
// Subscribes to GeneratorRun, Artifact, and AuditEvent for live updates.
// Uses aggregate({dateBucket}) for 7-day throughput trends (server-side, not JS math).
export function useDashboardData() {
  const [metrics, setMetrics] = useState({
    generators: null, runs: null, artifacts: null, validations: null,
    approvals: null, provisioning: null, repairTasks: null, auditEvents: null,
  });
  const [recentRuns, setRecentRuns] = useState([]);
  const [activityFeed, setActivityFeed] = useState([]);
  const [throughput, setThroughput] = useState([]);
  const [validationTrend, setValidationTrend] = useState([]);
  const [insights, setInsights] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [live, setLive] = useState(false);
  const mountedRef = useRef(true);

  const loadCounts = useCallback(async () => {
    try {
      const [gens, runs, arts, vals, apps, prov, repairs, audits] = await Promise.all([
        base44.entities.GeneratorDefinition.count({}),
        base44.entities.GeneratorRun.count({}),
        base44.entities.Artifact.count({}),
        base44.entities.RunValidation.count({}),
        base44.entities.Approval.count({ status: "pending" }),
        base44.entities.ProvisioningPlan.count({}),
        base44.entities.RepairTask.count({ status: "open" }),
        base44.entities.AuditEvent.count({}),
      ]);
      if (!mountedRef.current) return;
      setMetrics({ generators: gens, runs, artifacts: arts, validations: vals, approvals: apps, provisioning: prov, repairTasks: repairs, auditEvents: audits });
    } catch { /* best-effort */ }
  }, []);

  const loadRecentRuns = useCallback(async () => {
    try {
      const page = await base44.entities.GeneratorRun.filter({}, { sort: "-created_date", limit: 8 });
      if (!mountedRef.current) return;
      setRecentRuns(page.items || []);
    } catch { /* best-effort */ }
  }, []);

  const loadActivityFeed = useCallback(async () => {
    try {
      const [runPage, auditPage] = await Promise.all([
        base44.entities.GeneratorRun.filter({}, { sort: "-created_date", limit: 5, fields: ["generator_key", "generator_version", "status", "created_date"] }),
        base44.entities.AuditEvent.filter({}, { sort: "-created_date", limit: 5, fields: ["event_type", "entity_type", "severity", "created_date"] }),
      ]);
      if (!mountedRef.current) return;
      const runs = (runPage.items || []).map((r) => ({ type: "run", ...r }));
      const audits = (auditPage.items || []).map((a) => ({ type: "audit", ...a }));
      const merged = [...runs, ...audits].sort((a, b) => new Date(b.created_date) - new Date(a.created_date)).slice(0, 10);
      setActivityFeed(merged);
    } catch { /* best-effort */ }
  }, []);

  const loadThroughput = useCallback(async () => {
    try {
      // Server-side daily bucketing of runs over last 7 days — one aggregate call.
      const res = await base44.entities.GeneratorRun.aggregate({
        dateBucket: { field: "created_date", unit: "day" },
        groupBy: "status",
        limit: 100,
      });
      if (!mountedRef.current) return;
      // Transform {rows: [{_bucket_date, status, count}]} into chart-ready daily totals.
      const byDay = {};
      (res.rows || []).forEach((row) => {
        const day = row._bucket_date || row.created_date || "unknown";
        if (!byDay[day]) byDay[day] = { date: day, total: 0, passed: 0, failed: 0, other: 0 };
        byDay[day].total += row.count || 0;
        if (row.status === "PASSED") byDay[day].passed += row.count || 0;
        else if (row.status === "FAILED") byDay[day].failed += row.count || 0;
        else byDay[day].other += row.count || 0;
      });
      setThroughput(Object.values(byDay).sort((a, b) => new Date(a.date) - new Date(b.date)).slice(-7));
    } catch { /* best-effort */ }
  }, []);

  const loadValidationTrend = useCallback(async () => {
    try {
      const res = await base44.entities.RunValidation.aggregate({
        dateBucket: { field: "created_date", unit: "day" },
        groupBy: "status",
        limit: 100,
      });
      if (!mountedRef.current) return;
      const byDay = {};
      (res.rows || []).forEach((row) => {
        const day = row._bucket_date || "unknown";
        if (!byDay[day]) byDay[day] = { date: day, pass: 0, fail: 0, blocked: 0 };
        if (row.status === "PASS") byDay[day].pass += row.count || 0;
        else if (row.status === "FAIL") byDay[day].fail += row.count || 0;
        else if (row.status === "BLOCKED") byDay[day].blocked += row.count || 0;
      });
      setValidationTrend(Object.values(byDay).sort((a, b) => new Date(a.date) - new Date(b.date)).slice(-7));
    } catch { /* best-effort */ }
  }, []);

  const loadInsights = useCallback(async () => {
    if (insightsLoading) return;
    setInsightsLoading(true);
    try {
      const summary = `Factory OS dashboard snapshot: ${metrics.generators ?? 0} generators, ${metrics.runs ?? 0} runs, ${metrics.artifacts ?? 0} artifacts, ${metrics.validations ?? 0} validations, ${metrics.approvals ?? 0} pending approvals, ${metrics.repairTasks ?? 0} open repair tasks, ${metrics.auditEvents ?? 0} audit events. Throughput (7d): ${throughput.map((t) => `${t.date.split("T")[0]}=${t.total}`).join(", ")}. Validation trend (7d): ${validationTrend.map((v) => `${v.date.split("T")[0]} pass=${v.pass} fail=${v.fail}`).join(", ")}. Analyze this factory platform's health. Identify anomalies (failure spikes, validation drops, bottlenecks). Predict risks for the next 24h. Recommend the top 3 actions. Be concise — 4 short bullet points max.`;
      const res = await base44.functions.invoke("vercelAI", { prompt: summary });
      if (!mountedRef.current) return;
      setInsights(res?.content || "No insights available.");
    } catch (e) {
      if (!mountedRef.current) return;
      setInsights("AI insights unavailable — Vercel AI Gateway not configured or error.");
    } finally {
      if (mountedRef.current) setInsightsLoading(false);
    }
  }, [metrics, throughput, validationTrend, insightsLoading]);

  // Initial load
  useEffect(() => {
    mountedRef.current = true;
    (async () => {
      await Promise.all([loadCounts(), loadRecentRuns(), loadActivityFeed(), loadThroughput(), loadValidationTrend()]);
      if (mountedRef.current) setLoading(false);
    })();
    return () => { mountedRef.current = false; };
  }, []);

  // Real-time subscriptions — the ceiling: live updates, not polling.
  useEffect(() => {
    if (loading) return;
    let unsubRun, unsubArtifact, unsubAudit;
    try {
      unsubRun = base44.entities.GeneratorRun.subscribe((event) => {
        setLive(true);
        loadCounts();
        loadRecentRuns();
        loadActivityFeed();
        loadThroughput();
      });
    } catch { /* subscriptions best-effort */ }
    try {
      unsubArtifact = base44.entities.Artifact.subscribe((event) => {
        setLive(true);
        loadCounts();
        loadActivityFeed();
      });
    } catch { /* best-effort */ }
    try {
      unsubAudit = base44.entities.AuditEvent.subscribe((event) => {
        setLive(true);
        loadCounts();
        loadActivityFeed();
      });
    } catch { /* best-effort */ }
    return () => {
      unsubRun?.();
      unsubArtifact?.();
      unsubAudit?.();
    };
  }, [loading]);

  return {
    metrics, recentRuns, activityFeed, throughput, validationTrend,
    insights, insightsLoading, loadInsights, loading, live,
  };
}