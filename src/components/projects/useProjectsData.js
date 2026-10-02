import { useEffect, useState, useRef, useCallback } from "react";
import { base44 } from "@/api/base44Client";

// Ceiling projects hook: real-time subscriptions + per-project run stats via aggregate.
export function useProjectsData() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [live, setLive] = useState(false);
  const [stats, setStats] = useState({});
  const mountedRef = useRef(true);

  const loadProjects = useCallback(async () => {
    try {
      const page = await base44.entities.Project.filter({}, { sort: "-created_date", limit: 50 });
      if (!mountedRef.current) return;
      setProjects(page.items || []);
    } catch { /* best-effort */ }
  }, []);

  const loadStats = useCallback(async () => {
    try {
      // One aggregate call for per-project run counts.
      const res = await base44.entities.GeneratorRun.aggregate({
        groupBy: "project_id",
        limit: 100,
      });
      if (!mountedRef.current) return;
      const map = {};
      (res.rows || []).forEach((row) => {
        if (row.project_id) map[row.project_id] = row.count || 0;
      });
      setStats(map);
    } catch { /* best-effort */ }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    (async () => {
      await Promise.all([loadProjects(), loadStats()]);
      if (mountedRef.current) setLoading(false);
    })();
    return () => { mountedRef.current = false; };
  }, []);

  // Real-time subscription
  useEffect(() => {
    if (loading) return;
    let unsub;
    try {
      unsub = base44.entities.Project.subscribe(() => {
        setLive(true);
        loadProjects();
      });
    } catch { /* best-effort */ }
    return () => unsub?.();
  }, [loading]);

  return { projects, loading, live, stats, reload: loadProjects };
}