import React from "react";
import { Link } from "react-router-dom";
import { Boxes, Terminal, Package, ShieldCheck, CheckSquare, Server, Activity, Zap, AlertTriangle, Wrench } from "lucide-react";
import { counts } from "@/lib/factory/generator/registry";
import { adapterHealthSummary } from "@/lib/factory/generator/adapters";
import { useDashboardData } from "@/components/dashboard/useDashboardData";
import MetricCard from "@/components/dashboard/MetricCard";
import LiveActivityStream from "@/components/dashboard/LiveActivityStream";
import AIInsightsPanel from "@/components/dashboard/AIInsightsPanel";
import SystemHealthScore from "@/components/dashboard/SystemHealthScore";
import { ThroughputChart, ValidationTrendChart } from "@/components/dashboard/ThroughputChart";

export default function Dashboard() {
  const {
    metrics, recentRuns, activityFeed, throughput, validationTrend,
    insights, insightsLoading, loadInsights, loading, live,
  } = useDashboardData();

  const adapters = adapterHealthSummary();

  // Build sparkline data from throughput (daily totals) for each metric card.
  const runSparkline = throughput.map((t) => t.total);
  const artifactSparkline = throughput.map((t) => t.passed + t.other);
  const validationSparkline = validationTrend.map((v) => v.pass + v.fail + v.blocked);

  const cards = [
    { label: "Generators", value: metrics.generators, icon: Boxes, to: "/generators", hint: `${counts.generator_types} types available` },
    { label: "Runs", value: metrics.runs, icon: Terminal, to: "/runs", sparkline: runSparkline },
    { label: "Artifacts", value: metrics.artifacts, icon: Package, to: "/artifacts", sparkline: artifactSparkline },
    { label: "Validations", value: metrics.validations, icon: ShieldCheck, to: "/validation", sparkline: validationSparkline },
    { label: "Pending Approvals", value: metrics.approvals, icon: CheckSquare, to: "/approvals" },
    { label: "Provisioning Plans", value: metrics.provisioning, icon: Server, to: "/provisioning" },
    { label: "Open Repairs", value: metrics.repairTasks, icon: Wrench, to: "/repair" },
    { label: "Audit Events", value: metrics.auditEvents, icon: Activity, to: "/audit" },
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
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${live ? "bg-green-500 animate-pulse" : "bg-gray-300"}`} />
            <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{live ? "Live" : "Snapshot"}</span>
          </div>
          <div className="xa-pill-badge">Production Runtime</div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
        {cards.map((c) => (
          <MetricCard key={c.label} {...c} loading={loading} />
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-4">
        <LiveActivityStream feed={activityFeed} live={live} />
        <SystemHealthScore adapters={adapters} throughput={throughput} validationTrend={validationTrend} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mb-4">
        <ThroughputChart data={throughput} />
        <ValidationTrendChart data={validationTrend} />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-4">
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

        <AIInsightsPanel insights={insights} loading={insightsLoading} onRefresh={loadInsights} />
      </div>

      <div className="xa-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-4 h-4 text-[#0d2f96]" />
          <h2 className="text-sm font-bold uppercase tracking-wide">Adapter Health</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {adapters.map((a) => (
            <Link key={a.adapter_key} to="/adapters" className="flex items-center justify-between text-xs p-2 rounded-lg hover:bg-muted transition-colors">
              <span className="font-medium truncate">{a.name}</span>
              <span className={`font-bold px-1.5 py-0.5 rounded whitespace-nowrap ${a.health_state === "healthy" ? "text-green-600 bg-green-50" : a.health_state === "disabled" ? "text-gray-400 bg-gray-50" : "text-amber-600 bg-amber-50"}`}>
                {a.health_state === "not_configured" ? "NOT_CFG" : a.health_state.toUpperCase()}
              </span>
            </Link>
          ))}
        </div>
      </div>

      <div className="xa-card p-5 mt-4 border-amber-200">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="text-sm">
            <div className="font-bold">AI provider: Vercel AI Gateway</div>
            <div className="text-muted-foreground mt-1">
              Agent conversations, AI generator steps, evaluations, logos, palettes, and dashboard insights route through your server-side Vercel AI Gateway. No platform-AI fallback.
              Sandbox execution and external provisioning still require their own configured adapters.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}