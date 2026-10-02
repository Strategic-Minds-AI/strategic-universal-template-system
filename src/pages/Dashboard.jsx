import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Boxes, Terminal, Package, ShieldCheck, CheckSquare, Server, Brain, Activity, Zap, AlertTriangle } from "lucide-react";
import { generatorTypes, counts } from "@/lib/factory/generator/registry";
import { adapterHealthSummary } from "@/lib/factory/generator/adapters";

export default function Dashboard() {
  const [metrics, setMetrics] = useState({ generators: null, runs: null, artifacts: null, validations: null, approvals: null, provisioning: null });
  const [recentRuns, setRecentRuns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [gens, runs, arts, vals, apps, prov] = await Promise.all([
          base44.entities.GeneratorDefinition.count({}),
          base44.entities.GeneratorRun.count({}),
          base44.entities.Artifact.count({}),
          base44.entities.RunValidation.count({}),
          base44.entities.Approval.count({ status: "pending" }),
          base44.entities.ProvisioningPlan.count({}),
        ]);
        setMetrics({ generators: gens, runs: runs, artifacts: arts, validations: vals, approvals: apps, provisioning: prov });
        const runPage = await base44.entities.GeneratorRun.filter({}, { sort: "-created_date", limit: 8 });
        setRecentRuns(runPage.items || []);
      } catch (e) {
        // metrics load best-effort
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const adapters = adapterHealthSummary();
  const configuredAdapters = adapters.filter((a) => a.configured).length;

  const cards = [
    { label: "Generators", value: metrics.generators, icon: Boxes, to: "/generators", hint: `${counts.generator_types} types available` },
    { label: "Runs", value: metrics.runs, icon: Terminal, to: "/runs" },
    { label: "Artifacts", value: metrics.artifacts, icon: Package, to: "/artifacts" },
    { label: "Validations", value: metrics.validations, icon: ShieldCheck, to: "/validation" },
    { label: "Pending Approvals", value: metrics.approvals, icon: CheckSquare, to: "/approvals" },
    { label: "Provisioning Plans", value: metrics.provisioning, icon: Server, to: "/provisioning" },
  ];

  const statusColor = (s) => ({
    PASSED: "text-[#0d2f96] bg-[#e6f0ff]", FAILED: "text-red-600 bg-red-50",
    BLOCKED: "text-amber-600 bg-amber-50", RUNNING: "text-blue-600 bg-blue-50",
    WAITING_APPROVAL: "text-purple-600 bg-purple-50", CANCELLED: "text-gray-500 bg-gray-50",
    EXPORTED: "text-green-600 bg-green-50",
  }[s] || "text-gray-500 bg-gray-50");

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black font-heading text-foreground">Universal Factory OS</h1>
          <p className="text-sm text-muted-foreground mt-1">Generator-of-generators platform · registry v1.0.0 · {counts.generator_types + counts.ai_consulting_templates + counts.provisioning_templates} definitions available</p>
        </div>
        <div className="xa-pill-badge">Production Runtime</div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Link key={c.label} to={c.to} className="xa-card p-4 hover:shadow-md transition-shadow">
              <Icon className="w-5 h-5 text-[#0d2f96] mb-2" />
              <div className="text-2xl font-black font-heading">{loading ? "—" : (c.value ?? 0)}</div>
              <div className="text-xs text-muted-foreground font-medium">{c.label}</div>
              {c.hint && <div className="text-[10px] text-muted-foreground mt-0.5">{c.hint}</div>}
            </Link>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="xa-card p-5 lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-[#0d2f96]" />
            <h2 className="text-sm font-bold uppercase tracking-wide">Recent Runs</h2>
          </div>
          {recentRuns.length === 0 ? (
            <div className="text-sm text-muted-foreground py-8 text-center">
              No runs yet. <Link to="/generators" className="text-[#0d2f96] font-semibold underline">Browse generators</Link> to start one.
            </div>
          ) : (
            <div className="space-y-2">
              {recentRuns.map((r) => (
                <Link key={r.id} to={`/runs?run=${r.id}`} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-muted transition-colors">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold truncate">{r.generator_key} <span className="text-muted-foreground font-normal">v{r.generator_version}</span></div>
                    <div className="text-xs text-muted-foreground font-mono">{r.id.slice(0, 12)}</div>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${statusColor(r.status)}`}>{r.status}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="xa-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-[#0d2f96]" />
            <h2 className="text-sm font-bold uppercase tracking-wide">Adapter Health</h2>
          </div>
          <div className="space-y-2">
            {adapters.slice(0, 8).map((a) => (
              <div key={a.adapter_key} className="flex items-center justify-between text-xs">
                <span className="font-medium truncate">{a.name}</span>
                <span className={`font-bold px-1.5 py-0.5 rounded ${a.health_state === "healthy" ? "text-green-600 bg-green-50" : a.health_state === "disabled" ? "text-gray-400 bg-gray-50" : "text-amber-600 bg-amber-50"}`}>
                  {a.health_state === "not_configured" ? "NOT_CONFIGURED" : a.health_state.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-border text-xs text-muted-foreground">
            {configuredAdapters}/{adapters.length} adapters configured
          </div>
        </div>
      </div>

      <div className="xa-card p-5 mt-4 border-amber-200">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="text-sm">
            <div className="font-bold">AI provider: Vercel AI Gateway</div>
            <div className="text-muted-foreground mt-1">
              Agent conversations, AI generator steps, evaluations, logos, and palettes route through your server-side Vercel AI Gateway. No platform-AI fallback.
              Sandbox execution and external provisioning still require their own configured adapters.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}