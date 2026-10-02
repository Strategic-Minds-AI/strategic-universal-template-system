import React, { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Terminal, ArrowLeft, Activity, Zap, Clock, CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react";
import { StatusPill } from "@/components/factory/EntityListPage.jsx";
import SectionPreviewBanner from "@/components/sectionRenders/SectionPreviewBanner.jsx";
import ExecutionRender from "@/components/sectionRenders/ExecutionRender.jsx";

export default function RunConsole() {
  const [params, setParams] = useSearchParams();
  const runId = params.get("run");
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [steps, setSteps] = useState([]);
  const [stepsLoading, setStepsLoading] = useState(false);
  const [live, setLive] = useState(false);
  const mountedRef = useRef(true);

  const loadRuns = async () => {
    try {
      const page = await base44.entities.GeneratorRun.filter({}, { sort: "-created_date", limit: 50 });
      if (!mountedRef.current) return;
      setRuns(page.items || []);
    } catch { /* empty */ }
    if (mountedRef.current) setLoading(false);
  };

  useEffect(() => {
    mountedRef.current = true;
    loadRuns();
    return () => { mountedRef.current = false; };
  }, []);

  // Real-time subscription for live run updates
  useEffect(() => {
    if (loading) return;
    let unsub;
    try {
      unsub = base44.entities.GeneratorRun.subscribe(() => { setLive(true); loadRuns(); });
    } catch { /* best-effort */ }
    return () => unsub?.();
  }, [loading]);

  // Real-time subscription for live step updates when viewing a run
  useEffect(() => {
    if (!runId) { setSelected(null); setSteps([]); return; }
    let unsubStep;
    const loadDetail = async () => {
      setStepsLoading(true);
      try {
        const run = await base44.entities.GeneratorRun.get(runId);
        if (!mountedRef.current) return;
        setSelected(run);
        const sp = await base44.entities.RunStep.filter({ run_id: runId }, { sort: "created_date", limit: 200 });
        if (!mountedRef.current) return;
        setSteps(sp.items || []);
      } catch { setSelected(null); }
      if (mountedRef.current) setStepsLoading(false);
    };
    loadDetail();
    try {
      unsubStep = base44.entities.RunStep.subscribe(() => { setLive(true); loadDetail(); });
    } catch { /* best-effort */ }
    return () => unsubStep?.();
  }, [runId]);

  // Status summary
  const statusCounts = runs.reduce((acc, r) => { acc[r.status] = (acc[r.status] || 0) + 1; return acc; }, {});

  if (runId) {
    const stepStatusIcon = (s) => {
      if (s === "passed") return <CheckCircle className="w-4 h-4 text-green-600" />;
      if (s === "failed") return <XCircle className="w-4 h-4 text-red-600" />;
      if (s === "blocked") return <AlertCircle className="w-4 h-4 text-amber-600" />;
      if (s === "running") return <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />;
      return <Clock className="w-4 h-4 text-gray-400" />;
    };

    return (
      <div className="p-6 md:p-8 max-w-5xl mx-auto">
        <button onClick={() => setParams({})} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4"><ArrowLeft className="w-4 h-4" /> Back to runs</button>
        <div className="flex items-center gap-3 mb-4">
          <div className="xa-icon-chip"><Terminal className="w-5 h-5" /></div>
          <div className="min-w-0">
            <h1 className="text-xl font-black font-heading flex items-center gap-2">
              {selected?.generator_key || "Run"} <span className="text-muted-foreground font-normal">v{selected?.generator_version}</span>
              <span className="flex items-center gap-1 ml-1">
                <span className={`w-2 h-2 rounded-full ${live ? "bg-green-500 animate-pulse" : "bg-gray-300"}`} />
                <span className="text-[9px] font-bold uppercase tracking-wide text-muted-foreground">{live ? "Live" : "Snapshot"}</span>
              </span>
            </h1>
            <p className="text-xs text-muted-foreground font-mono">{runId}</p>
          </div>
          {selected && <div className="ml-auto"><StatusPill status={selected.status} /></div>}
        </div>

        {/* Step pipeline visualization */}
        {steps.length > 0 && (
          <div className="xa-card p-4 mb-4">
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Execution Pipeline</div>
            <div className="flex items-center gap-1 overflow-x-auto xa-scroll pb-2">
              {steps.map((s, i) => (
                <React.Fragment key={s.id}>
                  {i > 0 && <span className="text-muted-foreground/30">→</span>}
                  <div className={`flex flex-col items-center gap-1 px-2 py-1.5 rounded-lg whitespace-nowrap ${
                    s.status === "passed" ? "bg-green-50" : s.status === "failed" ? "bg-red-50" : s.status === "running" ? "bg-blue-50" : "bg-muted"
                  }`}>
                    {stepStatusIcon(s.status)}
                    <span className="text-[10px] font-mono font-semibold">{s.step_key}</span>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {selected?.error && <div className="xa-card p-3 mb-3 text-xs text-red-600 font-mono break-all">{JSON.stringify(selected.error)}</div>}
        {stepsLoading ? (
          <div className="xa-card p-6 text-center text-sm text-muted-foreground flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Loading steps…</div>
        ) : steps.length === 0 ? (
          <div className="xa-card xa-card-subtle p-8 text-center text-sm text-muted-foreground">No steps recorded for this run.</div>
        ) : (
          <div className="space-y-2">
            {steps.map((s) => (
              <div key={s.id} className="xa-card p-3 flex items-center gap-3">
                {stepStatusIcon(s.status)}
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold">{s.step_key} <span className="text-muted-foreground font-normal text-xs">· {s.step_type}</span></div>
                  {s.error && <div className="text-xs text-red-600 font-mono mt-0.5 break-all">{JSON.stringify(s.error).slice(0, 200)}</div>}
                  {s.output && <div className="text-[10px] text-muted-foreground font-mono mt-0.5 truncate">{JSON.stringify(s.output).slice(0, 100)}</div>}
                </div>
                <div className="ml-auto flex items-center gap-3">
                  {s.started_at && s.completed_at && (
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {((new Date(s.completed_at) - new Date(s.started_at)) / 1000).toFixed(1)}s
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground font-mono whitespace-nowrap">{s.attempt_count || 0} attempts</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <SectionPreviewBanner render={ExecutionRender} label="Execution" />
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="xa-icon-chip"><Terminal className="w-5 h-5" /></div>
          <div>
            <h1 className="text-xl font-black font-heading flex items-center gap-2">
              Run Console
              <span className="flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${live ? "bg-green-500 animate-pulse" : "bg-gray-300"}`} />
                <span className="text-[9px] font-bold uppercase tracking-wide text-muted-foreground">{live ? "Live" : "Snapshot"}</span>
              </span>
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">Generator execution history with step-level lineage.</p>
          </div>
        </div>
        {/* Status summary */}
        {runs.length > 0 && (
          <div className="flex items-center gap-2">
            {Object.entries(statusCounts).slice(0, 5).map(([status, count]) => (
              <span key={status} className="flex items-center gap-1 text-xs">
                <StatusPill status={status} />
                <span className="font-bold">{count}</span>
              </span>
            ))}
          </div>
        )}
      </div>
      {loading ? (
        <div className="xa-card p-6 text-center text-sm text-muted-foreground flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Loading…</div>
      ) : runs.length === 0 ? (
        <div className="xa-card xa-card-subtle p-12 text-center">
          <Terminal className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <div className="text-sm font-semibold">No runs yet</div>
          <div className="text-xs text-muted-foreground mt-1">Runs appear here once a generator executes.</div>
        </div>
      ) : (
        <div className="xa-card overflow-hidden">
          <div className="overflow-x-auto xa-scroll">
            <table className="w-full text-sm">
              <thead className="bg-muted/60 text-muted-foreground">
                <tr>
                  <th className="text-left font-semibold text-xs uppercase px-4 py-2.5">Generator</th>
                  <th className="text-left font-semibold text-xs uppercase px-4 py-2.5">Status</th>
                  <th className="text-left font-semibold text-xs uppercase px-4 py-2.5">Started</th>
                  <th className="text-left font-semibold text-xs uppercase px-4 py-2.5">Run ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {runs.map((r) => (
                  <tr key={r.id} className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setParams({ run: r.id })}>
                    <td className="px-4 py-2.5 font-semibold">{r.generator_key} <span className="text-muted-foreground font-normal">v{r.generator_version}</span></td>
                    <td className="px-4 py-2.5"><StatusPill status={r.status} /></td>
                    <td className="px-4 py-2.5 text-xs text-muted-foreground whitespace-nowrap">{r.started_at ? new Date(r.started_at).toLocaleString() : "—"}</td>
                    <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{r.id.slice(0, 12)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}