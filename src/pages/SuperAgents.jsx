import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SUPER_AGENTS, AGENT_CATEGORIES, REGISTRY_VERSION } from "@/lib/factory/superAgents";
import { Sparkles, Wrench, ArrowRight } from "lucide-react";

export default function SuperAgents() {
  const navigate = useNavigate();
  const [category, setCategory] = useState("All");
  const filtered = category === "All" ? SUPER_AGENTS : SUPER_AGENTS.filter((a) => a.category === category);

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <span className="xa-pill-badge">SUPER AGENTS · v{REGISTRY_VERSION}</span>
          <h1 className="text-2xl font-black font-heading text-foreground mt-2">Universal Agent & Template Registry</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Each super agent is both an <strong>operator</strong> (system prompt + tools) and a versioned <strong>template</strong>.
            Launch one to bootstrap a ready-to-go system — just swap logo, accent color, content, images, and variables via the questionnaire.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-5">
        {AGENT_CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              category === c ? "bg-foreground text-background" : "text-muted-foreground bg-muted hover:bg-muted/70"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((a) => (
          <div key={a.key} className="xa-card p-5 flex flex-col">
            <div className="flex items-start justify-between mb-2">
              <span className="text-2xl">{a.icon}</span>
              <div className="flex flex-col items-end gap-1">
                {a.apex && <span className="text-[9px] font-bold uppercase tracking-wider text-[#0d2f96] bg-[#e6f0ff] px-1.5 py-0.5 rounded">Apex</span>}
                {a.flagship && <span className="text-[9px] font-bold uppercase tracking-wider text-[#0d2f96] bg-[#e6f0ff] px-1.5 py-0.5 rounded">Flagship</span>}
              </div>
            </div>
            <h3 className="font-heading font-bold text-sm text-foreground">{a.name}</h3>
            <div className="text-[10px] font-mono text-muted-foreground mb-2">{a.key} · v{a.version} · {a.category}</div>
            <p className="text-xs text-muted-foreground line-clamp-3 mb-3 flex-1">{a.description}</p>
            <div className="flex flex-wrap gap-1 mb-3">
              {a.skills.slice(0, 4).map((s) => (
                <span key={s} className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{s}</span>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => navigate(`/bootstrap?agent=${a.key}`)} className="xa-btn-primary text-xs flex-1" style={{ padding: "8px 12px" }}>
                <Wrench className="w-3.5 h-3.5" /> Bootstrap
              </button>
              <button onClick={() => navigate(`/agents/chat?agent=${a.key}`)} className="xa-btn-outline text-xs" style={{ padding: "8px 12px" }}>
                <Sparkles className="w-3.5 h-3.5" /> Operate
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="xa-card p-4 mt-5 border-amber-200">
        <div className="flex items-start gap-3">
          <ArrowRight className="w-4 h-4 text-[#0d2f96] shrink-0 mt-0.5" />
          <div className="text-xs text-muted-foreground">
            <strong className="text-foreground">How it works:</strong> Pick an agent → answer the brand questionnaire (logo, accent color, content, images, variables) →
            the factory deterministically renders a ready-to-go template packet (file tree + manifest, SHA-256 integrity).
            AI enrichment (copywriting, code generation, outreach) re-enables when workspace integration credits reset on 2026-10-12 — until then those steps return <span className="font-mono font-semibold">NOT_CONFIGURED</span> honestly.
          </div>
        </div>
      </div>
    </div>
  );
}