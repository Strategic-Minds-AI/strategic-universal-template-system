import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Search, Database, Mail, BarChart3, Building2, Workflow, ShieldAlert,
  Download, CheckCircle2, AlertTriangle, ArrowLeft, Cpu,
} from "lucide-react";
import {
  LEAD_SCRAPER_SYSTEM, SEARCH_SOURCES, SEARCH_MODES, ADAPTER_REQUIREMENTS,
  CRM_STATUSES, OUTREACH_TEMPLATES, bootstrapScraper,
} from "@/lib/factory/leadScraperSystem";

export default function LeadScraper() {
  const sys = LEAD_SCRAPER_SYSTEM;
  const [answers, setAnswers] = useState({});
  const [packet, setPacket] = useState(null);
  const [bootstrapping, setBootstrapping] = useState(false);

  const set = (k, v) => setAnswers((a) => ({ ...a, [k]: v }));
  const schema = sys.template.variables_schema;

  const runBootstrap = async () => {
    setBootstrapping(true);
    try {
      const pkt = await bootstrapScraper(answers);
      setPacket(pkt);
    } finally {
      setBootstrapping(false);
    }
  };

  const downloadPacket = () => {
    const blob = new Blob([JSON.stringify(packet, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${sys.key}-bootstrap.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <Link to="/agents" className="p-2 rounded-lg hover:bg-muted"><ArrowLeft className="w-4 h-4" /></Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-[#CCBB00]" />
            <h1 className="text-xl font-black font-heading">{sys.name}</h1>
            <span className="xa-pill-badge" style={{ fontSize: 9, padding: "2px 8px" }}>v{sys.version}</span>
            <span className="text-[10px] font-mono text-muted-foreground">source v{sys.source_version}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">{sys.description}</p>
        </div>
      </div>

      {/* Capabilities */}
      <div className="xa-card p-4 mb-4">
        <h2 className="text-xs font-bold uppercase tracking-wide mb-3">Capabilities</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {[
            { icon: Search, label: "Multi-source search" },
            { icon: Building2, label: "Company intel" },
            { icon: Database, label: "CRM pipeline" },
            { icon: Mail, label: "Outreach email" },
            { icon: BarChart3, label: "Analytics" },
            { icon: Cpu, label: "AI keyword suggest" },
          ].map((c) => {
            const Icon = c.icon;
            return (
              <div key={c.label} className="flex items-center gap-2 text-xs">
                <Icon className="w-3.5 h-3.5 text-[#CCBB00]" />
                <span className="font-medium">{c.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sources + Modes */}
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div className="xa-card p-4">
          <h2 className="text-xs font-bold uppercase tracking-wide mb-3">Search Sources</h2>
          <div className="space-y-1.5">
            {SEARCH_SOURCES.map((s) => (
              <div key={s.id} className="flex items-center justify-between text-xs">
                <span className="font-semibold">{s.label}</span>
                <span className="text-muted-foreground">{s.desc}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="xa-card p-4">
          <h2 className="text-xs font-bold uppercase tracking-wide mb-3">Modes</h2>
          <div className="space-y-1.5">
            {SEARCH_MODES.map((m) => (
              <div key={m.id} className="flex items-center justify-between text-xs">
                <span className="font-semibold" style={{ color: m.color }}>{m.label}</span>
                <span className="text-muted-foreground">{m.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Adapter requirements */}
      <div className="xa-card p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Workflow className="w-3.5 h-3.5 text-[#CCBB00]" />
          <h2 className="text-xs font-bold uppercase tracking-wide">External Adapters</h2>
        </div>
        <div className="space-y-1.5">
          {ADAPTER_REQUIREMENTS.map((a) => (
            <div key={a.adapter_key} className="flex items-center justify-between text-xs">
              <div className="min-w-0">
                <span className="font-semibold">{a.name}</span>
                <span className="text-muted-foreground ml-2">{a.purpose}</span>
              </div>
              <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded ${a.required ? "text-amber-700 bg-amber-50" : "text-muted-foreground bg-muted"}`}>
                {a.credential}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Bootstrap form */}
      <div className="xa-card p-4 mb-4">
        <h2 className="text-xs font-bold uppercase tracking-wide mb-3">Bootstrap (deterministic)</h2>
        <div className="grid md:grid-cols-2 gap-3">
          {schema.map((v) => (
            <div key={v.key}>
              <label className="text-xs font-semibold flex items-center gap-1">
                {v.label}
                {v.required && <span className="text-red-500">*</span>}
              </label>
              {v.type === "select" ? (
                <select
                  value={answers[v.key] ?? v.default ?? ""}
                  onChange={(e) => set(v.key, e.target.value)}
                  className="w-full mt-1 px-2 py-1.5 text-sm rounded-lg border border-input bg-background"
                >
                  {v.options.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : (
                <input
                  type={v.type === "color" ? "color" : "text"}
                  value={answers[v.key] ?? v.default ?? ""}
                  onChange={(e) => set(v.key, e.target.value)}
                  placeholder={v.help}
                  className="w-full mt-1 px-2 py-1.5 text-sm rounded-lg border border-input bg-background"
                />
              )}
              {v.help && <div className="text-[10px] text-muted-foreground mt-0.5">{v.help}</div>}
            </div>
          ))}
        </div>
        <button onClick={runBootstrap} disabled={bootstrapping} className="xa-btn-primary text-xs mt-3">
          <Download className="w-3.5 h-3.5" /> {bootstrapping ? "Rendering…" : "Render bootstrap packet"}
        </button>
      </div>

      {/* Result */}
      {packet && (
        <div className="xa-card p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold uppercase tracking-wide">Bootstrap Packet</h2>
            <button onClick={downloadPacket} className="xa-btn-outline text-xs" style={{ padding: "6px 12px" }}>
              <Download className="w-3 h-3" /> Download JSON
            </button>
          </div>
          <div className="flex items-center gap-2 mb-3">
            {packet.validation.ready ? (
              <CheckCircle2 className="w-4 h-4 text-green-600" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            )}
            <span className="text-xs font-semibold">
              {packet.validation.ready ? "Ready — all required variables set" : `Missing: ${packet.validation.missing_required.join(", ")}`}
            </span>
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
              <ShieldAlert className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
              <div className="text-[11px]">
                <span className="font-bold">Live steps: NOT_CONFIGURED</span>
                <span className="text-muted-foreground block mt-0.5">{packet.ai_enrichment.reason}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CRM + Outreach reference */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="xa-card p-4">
          <h2 className="text-xs font-bold uppercase tracking-wide mb-2">CRM Pipeline Stages</h2>
          <div className="flex flex-wrap gap-1.5">
            {CRM_STATUSES.map((s) => (
              <span key={s} className="text-[11px] font-medium bg-muted px-2 py-1 rounded">{s}</span>
            ))}
          </div>
        </div>
        <div className="xa-card p-4">
          <h2 className="text-xs font-bold uppercase tracking-wide mb-2">Outreach Templates</h2>
          <div className="space-y-1">
            {OUTREACH_TEMPLATES.map((t) => (
              <div key={t.name} className="text-xs">
                <span className="font-semibold">{t.name}</span>
                <span className="text-muted-foreground block text-[11px]">→ {t.subject}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}