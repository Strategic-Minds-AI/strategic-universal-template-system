import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Terminal, ArrowLeft } from "lucide-react";
import { StatusPill } from "@/components/factory/EntityListPage.jsx";

export default function RunConsole() {
  const [params, setParams] = useSearchParams();
  const runId = params.get("run");
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [steps, setSteps] = useState([]);
  const [stepsLoading, setStepsLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const page = await base44.entities.GeneratorRun.filter({}, { sort: "-created_date", limit: 50 });
        setRuns(page.items || []);
      } catch (e) { /* empty */ }
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!runId) { setSelected(null); setSteps([]); return; }
    (async () => {
      setStepsLoading(true);
      try {
        const run = await base44.entities.GeneratorRun.get(runId);
        setSelected(run);
        const sp = await base44.entities.RunStep.filter({ run_id: runId }, { sort: "created_date", limit: 200 });
        setSteps(sp.items || []);
      } catch (e) { setSelected(null); }
      setStepsLoading(false);
    })();
  }, [runId]);

  if (runId) {
    return (
      <div className="p-6 md:p-8 max-w-5xl mx-auto">
        <button onClick={() => setParams({})} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4"><ArrowLeft className="w-4 h-4" /> Back to runs</button>
        <div className="flex items-center gap-3 mb-4">
          <div className="xa-icon-chip"><Terminal className="w-5 h-5" /></div>
          <div className="min-w-0">
            <h1 className="text-xl font-black font-heading">{selected?.generator_key || "Run"} <span className="text-muted-foreground font-normal">v{selected?.generator_version}</span></h1>
            <p className="text-xs text-muted-foreground font-mono">{runId}</p>
          </div>
          {selected && <div className="ml-auto"><StatusPill status={selected.status} /></div>}
        </div>
        {selected?.error && <div className="xa-card p-3 mb-3 text-xs text-red-600 font-mono break-all">{JSON.stringify(selected.error)}</div>}
        {stepsLoading ? (
          <div className="xa-card p-6 text-center text-sm text-muted-foreground">Loading steps…</div>
        ) : steps.length === 0 ? (
          <div className="xa-card xa-card-subtle p-8 text-center text-sm text-muted-foreground">No steps recorded for this run.</div>
        ) : (
          <div className="space-y-2">
            {steps.map((s) => (
              <div key={s.id} className="xa-card p-3 flex items-center gap-3">
                <StatusPill status={s.status} />
                <div className="min-w-0">
                  <div className="text-sm font-semibold">{s.step_key} <span className="text-muted-foreground font-normal text-xs">· {s.step_type}</span></div>
                  {s.error && <div className="text-xs text-red-600 font-mono mt-0.5 break-all">{JSON.stringify(s.error).slice(0, 200)}</div>}
                </div>
                <div className="ml-auto text-xs text-muted-foreground font-mono whitespace-nowrap">{s.attempt_count || 0} attempts</div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-5">
        <div className="xa-icon-chip"><Terminal className="w-5 h-5" /></div>
        <div>
          <h1 className="text-xl font-black font-heading">Run Console</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Generator execution history with step-level lineage.</p>
        </div>
      </div>
      {loading ? (
        <div className="xa-card p-6 text-center text-sm text-muted-foreground">Loading…</div>
      ) : runs.length === 0 ? (
        <div className="xa-card xa-card-subtle p-12 text-center">
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