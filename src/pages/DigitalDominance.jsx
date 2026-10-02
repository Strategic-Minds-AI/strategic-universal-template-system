import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Factory, ShieldCheck, Layers, MapPin, Beaker, Download, CheckCircle2,
  AlertTriangle, ArrowLeft, Cpu, Gauge, Boxes, Sparkles,
} from "lucide-react";
import {
  DIGITAL_DOMINANCE_SYSTEM, FACTORY_STAGES, GOOGLE_BENCHMARK_LAYERS, VARIATION_AXES,
  DEPLOY_PATTERNS, EXECUTION_MODES, FLEET_AGENTS, ADAPTER_REQUIREMENTS,
  CANONICAL_REGISTRIES, PRIORITY_WEIGHTS, calcPriorityScore, bootstrapDominance,
} from "@/lib/factory/digitalDominanceSystem";

export default function DigitalDominance() {
  const sys = DIGITAL_DOMINANCE_SYSTEM;
  const [answers, setAnswers] = useState({});
  const [packet, setPacket] = useState(null);
  const [bootstrapping, setBootstrapping] = useState(false);

  const set = (k, v) => setAnswers((a) => ({ ...a, [k]: v }));
  const schema = sys.template.variables_schema;

  const runBootstrap = async () => {
    setBootstrapping(true);
    try { setPacket(await bootstrapDominance(answers)); } finally { setBootstrapping(false); }
  };

  const downloadPacket = () => {
    const blob = new Blob([JSON.stringify(packet, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `${sys.key}-bootstrap.json`; a.click();
    URL.revokeObjectURL(url);
  };

  // demo priority score with sample gap
  const demoScore = calcPriorityScore({ severity: "P0", impact: "critical", confidence: 0.9, effort: "low", cost: "low", risk: "low" });

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <Link to="/agents" className="p-2 rounded-lg hover:bg-muted"><ArrowLeft className="w-4 h-4" /></Link>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Factory className="w-5 h-5 text-[#CCBB00]" />
            <h1 className="text-xl font-black font-heading">{sys.name}</h1>
            <span className="xa-pill-badge" style={{ fontSize: 9, padding: "2px 8px" }}>v{sys.version}</span>
            <span className="text-[10px] font-mono text-muted-foreground">source v{sys.source_version}</span>
            <span className="text-[10px] font-mono text-muted-foreground">· {sys.generator_type}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">{sys.description}</p>
        </div>
      </div>

      {/* 4-stage factory */}
      <div className="xa-card p-4 mb-4">
        <div className="flex items-center gap-2 mb-3"><Factory className="w-3.5 h-3.5 text-[#CCBB00]" /><h2 className="text-xs font-bold uppercase tracking-wide">4-Stage Factory</h2></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {FACTORY_STAGES.map((s, i) => (
            <div key={s.id} className="rounded-lg border border-border p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-5 h-5 rounded-full bg-[#FFEA00] text-black text-[11px] font-black flex items-center justify-center">{i + 1}</span>
                <span className="text-sm font-bold">{s.label}</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-snug">{s.desc}</p>
              <div className="text-[10px] font-mono text-muted-foreground mt-2">{s.gate}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Google 100% benchmark */}
      <div className="xa-card p-4 mb-4">
        <div className="flex items-center gap-2 mb-3"><ShieldCheck className="w-3.5 h-3.5 text-[#CCBB00]" /><h2 className="text-xs font-bold uppercase tracking-wide">Google 100% Benchmark (Distance-to-100)</h2></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
          {GOOGLE_BENCHMARK_LAYERS.map((l) => (
            <div key={l.id} className="flex items-start gap-2 text-xs">
              <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded shrink-0 ${l.weight === "P0" ? "bg-red-50 text-red-700" : l.weight === "P1" ? "bg-amber-50 text-amber-700" : "bg-muted text-muted-foreground"}`}>{l.weight}</span>
              <div className="min-w-0">
                <span className="font-semibold">{l.label}</span>
                <span className="text-muted-foreground block text-[11px] leading-snug">{l.desc}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="xa-card xa-card-subtle p-3 mt-3">
          <div className="flex items-center gap-2 mb-1"><Gauge className="w-3.5 h-3.5 text-[#CCBB00]" /><span className="text-xs font-bold">Repair priority formula</span></div>
          <code className="text-[11px] font-mono text-foreground block">priority = (SEVERITY × IMPACT × CONFIDENCE) / (TIME × COST × RISK)</code>
          <div className="text-[10px] text-muted-foreground mt-1">Sample P0/critical/0.9 confidence, low effort/cost/risk → score <span className="font-mono font-bold text-[#CCBB00]">{demoScore}</span></div>
        </div>
      </div>

      {/* Strategic content variation */}
      <div className="xa-card p-4 mb-4">
        <div className="flex items-center gap-2 mb-3"><Sparkles className="w-3.5 h-3.5 text-[#CCBB00]" /><h2 className="text-xs font-bold uppercase tracking-wide">Strategic Content Variation (no two sites identical)</h2></div>
        <div className="flex flex-wrap gap-1.5">
          {VARIATION_AXES.map((v) => (
            <span key={v.id} className="text-[11px] font-medium bg-muted px-2 py-1 rounded" title={v.desc}>{v.label}</span>
          ))}
        </div>
      </div>

      {/* Deploy patterns + execution modes */}
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div className="xa-card p-4">
          <div className="flex items-center gap-2 mb-3"><MapPin className="w-3.5 h-3.5 text-[#CCBB00]" /><h2 className="text-xs font-bold uppercase tracking-wide">Deploy Patterns</h2></div>
          <div className="space-y-1.5">
            {DEPLOY_PATTERNS.map((p) => (
              <div key={p.id} className="text-xs">
                <span className="font-semibold">{p.label}</span>
                <span className="font-mono text-[10px] text-[#CCBB00] ml-2">{p.pattern}</span>
                <span className="text-muted-foreground block text-[11px]">{p.desc}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="xa-card p-4">
          <div className="flex items-center gap-2 mb-3"><Cpu className="w-3.5 h-3.5 text-[#CCBB00]" /><h2 className="text-xs font-bold uppercase tracking-wide">Execution Modes</h2></div>
          <div className="space-y-1.5">
            {EXECUTION_MODES.map((m) => (
              <div key={m.id} className="text-xs">
                <span className="font-semibold" style={{ color: m.color }}>{m.label}</span>
                <span className="text-muted-foreground block text-[11px]">{m.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fleet + canonical registries */}
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div className="xa-card p-4">
          <div className="flex items-center gap-2 mb-3"><Boxes className="w-3.5 h-3.5 text-[#CCBB00]" /><h2 className="text-xs font-bold uppercase tracking-wide">Fleet Agents</h2></div>
          <div className="space-y-1.5">
            {FLEET_AGENTS.map((a) => (
              <div key={a.key} className="flex items-start gap-2 text-xs">
                <span className="text-base leading-none">{a.icon}</span>
                <div className="min-w-0">
                  <span className="font-semibold">{a.name} <span className="text-[9px] font-mono text-muted-foreground">T{a.tier}</span></span>
                  <span className="text-muted-foreground block text-[11px] leading-snug">{a.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="xa-card p-4">
          <div className="flex items-center gap-2 mb-3"><Layers className="w-3.5 h-3.5 text-[#CCBB00]" /><h2 className="text-xs font-bold uppercase tracking-wide">Canonical Registries</h2></div>
          <div className="space-y-1.5">
            {CANONICAL_REGISTRIES.map((r) => (
              <div key={r.key} className="text-xs">
                <span className="font-mono font-semibold text-[11px]">{r.key}</span>
                <span className="text-muted-foreground block text-[11px] leading-snug">{r.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Adapter requirements */}
      <div className="xa-card p-4 mb-4">
        <div className="flex items-center gap-2 mb-3"><Beaker className="w-3.5 h-3.5 text-[#CCBB00]" /><h2 className="text-xs font-bold uppercase tracking-wide">External Adapters</h2></div>
        <div className="space-y-1.5">
          {ADAPTER_REQUIREMENTS.map((a) => (
            <div key={a.adapter_key} className="flex items-center justify-between text-xs">
              <div className="min-w-0">
                <span className="font-semibold">{a.name}</span>
                <span className="text-muted-foreground ml-2">{a.purpose}</span>
              </div>
              <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded ${a.required ? "text-amber-700 bg-amber-50" : "text-muted-foreground bg-muted"}`}>{a.credential}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bootstrap form */}
      <div className="xa-card p-4 mb-4">
        <h2 className="text-xs font-bold uppercase tracking-wide mb-3">Bootstrap (deterministic blueprint)</h2>
        <div className="grid md:grid-cols-2 gap-3">
          {schema.map((v) => (
            <div key={v.key}>
              <label className="text-xs font-semibold flex items-center gap-1">{v.label}{v.required && <span className="text-red-500">*</span>}</label>
              {v.type === "select" ? (
                <select value={answers[v.key] ?? v.default ?? ""} onChange={(e) => set(v.key, e.target.value)} className="w-full mt-1 px-2 py-1.5 text-sm rounded-lg border border-input bg-background">
                  {v.options.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : (
                <input type={v.type === "color" ? "color" : "text"} value={answers[v.key] ?? v.default ?? ""} onChange={(e) => set(v.key, e.target.value)} placeholder={v.help} className="w-full mt-1 px-2 py-1.5 text-sm rounded-lg border border-input bg-background" />
              )}
              {v.help && <div className="text-[10px] text-muted-foreground mt-0.5">{v.help}</div>}
            </div>
          ))}
        </div>
        <button onClick={runBootstrap} disabled={bootstrapping} className="xa-btn-primary text-xs mt-3"><Download className="w-3.5 h-3.5" /> {bootstrapping ? "Rendering…" : "Render dominance blueprint"}</button>
      </div>

      {/* Result */}
      {packet && (
        <div className="xa-card p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold uppercase tracking-wide">Blueprint Packet</h2>
            <button onClick={downloadPacket} className="xa-btn-outline text-xs" style={{ padding: "6px 12px" }}><Download className="w-3 h-3" /> Download JSON</button>
          </div>
          <div className="flex items-center gap-2 mb-3">
            {packet.validation.ready ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <AlertTriangle className="w-4 h-4 text-amber-500" />}
            <span className="text-xs font-semibold">{packet.validation.ready ? "Ready — all required variables set" : `Missing: ${packet.validation.missing_required.join(", ")}`}</span>
          </div>
          <div className="text-xs text-muted-foreground mb-2">{packet.files.length} files rendered (SHA-256 sealed):</div>
          <div className="space-y-1 max-h-48 overflow-y-auto xa-scroll">
            {packet.files.map((f) => (
              <div key={f.path} className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-foreground truncate">{f.path}</span>
                <span className="text-muted-foreground">{f.sha256.slice(0, 12)}…</span>
              </div>
            ))}
          </div>
          <div className="xa-card xa-card-subtle p-3 mt-3 border-amber-200">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
              <div className="text-[11px]"><span className="font-bold">Live steps: NOT_CONFIGURED</span><span className="text-muted-foreground block mt-0.5">{packet.ai_enrichment.reason}</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}