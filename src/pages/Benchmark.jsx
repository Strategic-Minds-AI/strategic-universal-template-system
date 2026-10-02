import React, { useState } from "react";
import {
  Trophy, Search, GitBranch, ShieldCheck, Cpu, Zap, AlertTriangle,
  CheckCircle2, XCircle, Clock, ArrowRight, Target, Microscope,
  Wrench, FileCode2, Gauge, Download,
} from "lucide-react";
import {
  BENCHMARK_VERSION, RESEARCH_DATE, TOP_SYSTEMS, BENCHMARK,
  REVERSE_ENGINEERED_STACK, FORENSIC_AUDIT, AUTONOMOUS_AGENTS,
  GAP_FILL_PLAN, SCORECARD,
} from "@/lib/factory/benchmarkSystem.js";

const SEVERITY_STYLE = {
  critical: { color: "text-red-600", bg: "bg-red-50", border: "border-red-200", icon: AlertTriangle },
  high: { color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", icon: AlertTriangle },
  medium: { color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", icon: Clock },
};

const STATUS_STYLE = {
  pending: { color: "text-amber-600", bg: "bg-amber-50", label: "Pending", icon: Clock },
  installing: { color: "text-blue-600", bg: "bg-blue-50", label: "Installing", icon: Zap },
  complete: { color: "text-green-600", bg: "bg-green-50", label: "Complete", icon: CheckCircle2 },
};

function ScoreCard({ icon: Icon, label, value, sub }) {
  return (
    <div className="xa-card p-4 flex items-center gap-3">
      <div className="xa-icon-chip shrink-0"><Icon className="w-5 h-5" /></div>
      <div className="min-w-0">
        <div className="text-2xl font-black font-heading leading-none">{value}</div>
        <div className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground mt-1">{label}</div>
        {sub && <div className="text-[10px] text-muted-foreground mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}

function TopSystemsTable() {
  return (
    <div className="xa-card overflow-hidden">
      <div className="px-5 py-3 border-b border-border bg-muted/40 flex items-center gap-2">
        <Search className="w-4 h-4 text-muted-foreground" />
        <h2 className="text-sm font-bold font-heading">Top 3 Similar Systems — Researched & Rated</h2>
        <span className="xa-pill-badge ml-auto" style={{ fontSize: 9 }}>{RESEARCH_DATE}</span>
      </div>
      <div className="overflow-x-auto xa-scroll">
        <table className="w-full text-sm">
          <thead className="bg-muted/30 text-muted-foreground">
            <tr>
              {["Rank", "System", "Rating", "Best For", "Key Strength", "Full-Stack", "Agent Mode", "Stripe", "GitHub Sync", "1-Click Deploy"].map((h) => (
                <th key={h} className="text-left font-semibold text-xs uppercase tracking-wider px-4 py-2.5 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {TOP_SYSTEMS.map((s) => (
              <tr key={s.name} className={s.selected_as_benchmark ? "bg-[#e6f0ff]/50" : "hover:bg-muted/30"}>
                <td className="px-4 py-3">
                  <span className={`flex items-center gap-1 font-black ${s.rank === 1 ? "text-[#0059ff]" : "text-muted-foreground"}`}>
                    {s.rank === 1 && <Trophy className="w-3.5 h-3.5" />}#{s.rank}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="font-bold">{s.name}</div>
                  <div className="text-[10px] text-muted-foreground font-mono">{s.url}</div>
                </td>
                <td className="px-4 py-3"><span className="font-bold text-amber-500">★ {s.rating}</span></td>
                <td className="px-4 py-3 text-xs text-muted-foreground max-w-[180px]">{s.best_for}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground max-w-[200px]">{s.key_strength}</td>
                <td className="px-4 py-3">{s.full_stack ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-red-400" />}</td>
                <td className="px-4 py-3">{s.agent_mode ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-red-400" />}</td>
                <td className="px-4 py-3">{s.stripe_native ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-red-400" />}</td>
                <td className="px-4 py-3">{s.github_sync ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-red-400" />}</td>
                <td className="px-4 py-3">{s.one_click_deploy ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-red-400" />}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BenchmarkSelection() {
  return (
    <div className="xa-card p-5 border-2 border-[#0059ff]/30 bg-gradient-to-br from-[#e6f0ff]/40 to-transparent">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0059ff] to-[#0d2f96] flex items-center justify-center shrink-0">
          <Trophy className="w-7 h-7 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg font-black font-heading">{BENCHMARK.name}</h2>
            <span className="xa-pill-badge" style={{ fontSize: 9 }}>Benchmark #1</span>
            <span className="text-xs font-bold text-amber-500">★ {BENCHMARK.rating}</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{BENCHMARK.best_for}</p>
          <p className="text-sm font-semibold mt-2">{BENCHMARK.key_strength}</p>
          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
            <span>📍 {BENCHMARK.url}</span>
            <span>💰 {BENCHMARK.pricing}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReverseEngineering() {
  return (
    <div className="xa-card overflow-hidden">
      <div className="px-5 py-3 border-b border-border bg-muted/40 flex items-center gap-2">
        <Microscope className="w-4 h-4 text-muted-foreground" />
        <h2 className="text-sm font-bold font-heading">Reverse-Engineered Technology Stack</h2>
        <span className="ml-auto text-[10px] text-muted-foreground font-mono">{REVERSE_ENGINEERED_STACK.length} layers</span>
      </div>
      <div className="divide-y divide-border">
        {REVERSE_ENGINEERED_STACK.map((layer) => (
          <div key={layer.layer} className="p-4 hover:bg-muted/20 transition-colors">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <GitBranch className="w-3.5 h-3.5 text-[#0059ff]" />
                  <h3 className="text-sm font-bold">{layer.layer}</h3>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{layer.capability}</p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {layer.technologies.map((t) => (
                    <span key={t} className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-muted text-foreground">{t}</span>
                  ))}
                </div>
              </div>
              <div className="max-w-[280px] text-right">
                <div className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">SMAI Equivalent</div>
                <div className="text-xs text-foreground">{layer.smai_equivalent}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ForensicAudit() {
  const [filter, setFilter] = useState("all");
  const filtered = filter === "all" ? FORENSIC_AUDIT : FORENSIC_AUDIT.filter((g) => g.severity === filter);
  return (
    <div className="xa-card overflow-hidden">
      <div className="px-5 py-3 border-b border-border bg-muted/40 flex items-center gap-2 flex-wrap">
        <ShieldCheck className="w-4 h-4 text-muted-foreground" />
        <h2 className="text-sm font-bold font-heading">Deep Forensic Audit — Gaps vs Benchmark</h2>
        <div className="ml-auto flex items-center gap-1">
          {["all", "critical", "high", "medium"].map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full transition-colors ${filter === f ? "bg-[#0059ff] text-white" : "bg-muted text-muted-foreground hover:bg-muted/70"}`}>
              {f} {f !== "all" && `(${FORENSIC_AUDIT.filter((g) => g.severity === f).length})`}
            </button>
          ))}
        </div>
      </div>
      <div className="divide-y divide-border">
        {filtered.map((gap) => {
          const sev = SEVERITY_STYLE[gap.severity];
          const SevIcon = sev.icon;
          const status = STATUS_STYLE[gap.fill_status] || STATUS_STYLE.pending;
          const StatusIcon = status.icon;
          return (
            <div key={gap.id} className={`p-4 border-l-4 ${sev.border} ${sev.bg}`}>
              <div className="flex items-start gap-3">
                <div className={`shrink-0 ${sev.color}`}><SevIcon className="w-4 h-4 mt-0.5" /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-[10px] font-bold text-muted-foreground">{gap.id}</span>
                    <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${sev.color} ${sev.bg}`}>{gap.severity}</span>
                    <span className="text-[10px] font-bold uppercase text-muted-foreground">{gap.category}</span>
                    {gap.autonomous && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#e6f0ff] text-[#0d2f96]">Autonomous</span>}
                  </div>
                  <h3 className="text-sm font-bold mt-1">{gap.gap}</h3>
                  <div className="grid md:grid-cols-2 gap-3 mt-2">
                    <div>
                      <div className="text-[10px] font-bold uppercase text-green-600 mb-0.5">Benchmark Has</div>
                      <p className="text-xs text-muted-foreground">{gap.benchmark_has}</p>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase text-red-600 mb-0.5">SMAI Status</div>
                      <p className="text-xs text-muted-foreground">{gap.smai_status}</p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="text-[10px] font-bold uppercase text-amber-600 mb-0.5">Impact</div>
                    <p className="text-xs text-muted-foreground">{gap.impact}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <Wrench className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs font-semibold">{gap.fill_technology}</span>
                    </div>
                    <div className={`flex items-center gap-1 ml-auto text-xs font-bold ${status.color}`}>
                      <StatusIcon className="w-3.5 h-3.5" /> {status.label}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AutonomousAgents() {
  return (
    <div className="xa-card overflow-hidden">
      <div className="px-5 py-3 border-b border-border bg-muted/40 flex items-center gap-2">
        <Cpu className="w-4 h-4 text-muted-foreground" />
        <h2 className="text-sm font-bold font-heading">Autonomous Agents — Installing in Repo</h2>
        <span className="ml-auto flex items-center gap-1 text-[10px] font-bold text-blue-600">
          <Zap className="w-3 h-3 animate-pulse" /> INSTALLING
        </span>
      </div>
      <div className="grid md:grid-cols-2 gap-4 p-4">
        {AUTONOMOUS_AGENTS.map((agent) => (
          <div key={agent.key} className="border border-border rounded-xl p-4 bg-gradient-to-br from-muted/30 to-transparent">
            <div className="flex items-start gap-3">
              <div className="text-3xl">{agent.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-bold font-heading">{agent.name}</h3>
                  <span className="text-[9px] font-mono text-muted-foreground">{agent.key}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{agent.description}</p>
                <div className="mt-2 text-[10px] text-muted-foreground">
                  <span className="font-bold">Source:</span> {agent.source}
                </div>
                <div className="mt-1 text-[10px] text-muted-foreground font-mono break-all">{agent.config_file}</div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {agent.tools.map((t) => (
                    <span key={t} className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-muted text-foreground">{t}</span>
                  ))}
                </div>
                <div className="mt-2 text-[10px]">
                  <span className="font-bold text-muted-foreground">Target Gaps:</span>{" "}
                  <span className="font-mono text-[#0059ff]">{agent.target_gaps.join(", ")}</span>
                </div>
                <div className="mt-2 p-2 rounded-lg bg-amber-50 border border-amber-200">
                  <div className="text-[10px] font-bold uppercase text-amber-700">Mandate</div>
                  <p className="text-xs text-amber-900 mt-0.5">{agent.mandate}</p>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${agent.speed === "fast" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
                    ⚡ {agent.speed.toUpperCase()}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">{agent.install_status.toUpperCase()}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function GapFillPlan() {
  return (
    <div className="xa-card overflow-hidden">
      <div className="px-5 py-3 border-b border-border bg-muted/40 flex items-center gap-2">
        <Target className="w-4 h-4 text-muted-foreground" />
        <h2 className="text-sm font-bold font-heading">Gap-Fill Installation Plan</h2>
        <span className="ml-auto text-[10px] text-muted-foreground font-mono">{GAP_FILL_PLAN.length} items</span>
      </div>
      <div className="overflow-x-auto xa-scroll">
        <table className="w-full text-sm">
          <thead className="bg-muted/30 text-muted-foreground">
            <tr>
              {["Gap", "Severity", "Technology to Install", "Assigned Agent", "Autonomous", "Status"].map((h) => (
                <th key={h} className="text-left font-semibold text-xs uppercase tracking-wider px-4 py-2.5 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {GAP_FILL_PLAN.map((item) => {
              const sev = SEVERITY_STYLE[item.severity];
              const status = STATUS_STYLE[item.status] || STATUS_STYLE.pending;
              const StatusIcon = status.icon;
              return (
                <tr key={item.gap_id} className="hover:bg-muted/30">
                  <td className="px-4 py-2.5"><span className="font-mono text-[10px] font-bold text-muted-foreground">{item.gap_id}</span></td>
                  <td className="px-4 py-2.5"><span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${sev.color} ${sev.bg}`}>{item.severity}</span></td>
                  <td className="px-4 py-2.5 text-xs font-semibold">{item.technology}</td>
                  <td className="px-4 py-2.5">
                    {item.autonomous ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-[#0059ff]"><Cpu className="w-3 h-3" /> {item.assigned_agent}</span>
                    ) : (
                      <span className="text-xs text-muted-foreground">manual</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5">{item.autonomous ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-muted-foreground" />}</td>
                  <td className="px-4 py-2.5">
                    <span className={`flex items-center gap-1 text-[10px] font-bold ${status.color}`}><StatusIcon className="w-3 h-3" /> {status.label}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function Benchmark() {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <div className="xa-icon-chip shrink-0"><Trophy className="w-5 h-5" /></div>
          <div>
            <h1 className="text-xl font-black font-heading flex items-center gap-2">
              Benchmark System
              <span className="xa-pill-badge" style={{ fontSize: 9 }}>v{BENCHMARK_VERSION}</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Competitive benchmark → reverse engineering → forensic audit → autonomous gap-fill. 100% code mandatory.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a href="https://lovable.dev" target="_blank" rel="noopener noreferrer"
            className="xa-btn-outline text-xs">
            <Download className="w-3.5 h-3.5" /> View Benchmark
          </a>
        </div>
      </div>

      {/* Scorecard */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <ScoreCard icon={Target} label="Total Gaps" value={SCORECARD.total_gaps} />
        <ScoreCard icon={AlertTriangle} label="Critical" value={SCORECARD.critical} sub="must fix" />
        <ScoreCard icon={Clock} label="High" value={SCORECARD.high} />
        <ScoreCard icon={Cpu} label="Agents Installing" value={SCORECARD.agents_installing} sub="autonomous" />
        <ScoreCard icon={Zap} label="Autonomous Gaps" value={SCORECARD.autonomous_gaps} sub="agent-filled" />
        <ScoreCard icon={Wrench} label="Manual Gaps" value={SCORECARD.manual_gaps} />
      </div>

      {/* Mandate banner */}
      <div className="xa-card p-4 border-l-4 border-l-[#0059ff] bg-gradient-to-r from-[#e6f0ff]/40 to-transparent">
        <div className="flex items-center gap-3">
          <Gauge className="w-5 h-5 text-[#0059ff] shrink-0" />
          <p className="text-sm font-semibold">{SCORECARD.mandate}</p>
        </div>
      </div>

      {/* Pipeline flow */}
      <div className="flex items-center gap-2 flex-wrap text-xs font-bold">
        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted"><Search className="w-3.5 h-3.5" /> Research</span>
        <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted"><Trophy className="w-3.5 h-3.5" /> Select #1</span>
        <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted"><Microscope className="w-3.5 h-3.5" /> Reverse Engineer</span>
        <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted"><ShieldCheck className="w-3.5 h-3.5" /> Forensic Audit</span>
        <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted"><Cpu className="w-3.5 h-3.5" /> Install Agents</span>
        <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0059ff] text-white"><Zap className="w-3.5 h-3.5" /> Fill Gaps</span>
      </div>

      <TopSystemsTable />
      <BenchmarkSelection />
      <ReverseEngineering />
      <ForensicAudit />
      <AutonomousAgents />
      <GapFillPlan />
    </div>
  );
}