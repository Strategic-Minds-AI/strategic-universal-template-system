import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles, ClipboardList, Target, Shield, Bot, BookOpen, Workflow, FileText, Package } from "lucide-react";
import BrandLogo from "@/components/factory/BrandLogo.jsx";
import {
  DISCOVERY_TEMPLATES, READINESS_DIMENSIONS, CONSULTING_SERVICES, CONSULTING_PACKAGES,
  CONSULTING_DOCUMENTS, CUSTOMER_JOURNEY, scoreReadiness,
} from "@/lib/factory/consultingTemplates.js";

export default function Consulting() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("overview");

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/")} className="p-2 rounded-lg hover:bg-muted transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <BrandLogo size={28} />
          </div>
          <span className="xa-pill-badge" style={{ fontSize: 10 }}>AI Consulting Factory</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <h1 className="font-heading font-black text-2xl mb-1">AI Consulting Factory</h1>
        <p className="text-sm text-muted-foreground mb-6 max-w-2xl">
          Move a prospect from discovery to managed service using governed, schema-driven templates.
          Readiness scores are computed from inputs — no fabricated metrics.
        </p>

        <div className="flex flex-wrap gap-1.5 mb-6">
          {[
            { id: "overview", label: "Overview", icon: Sparkles },
            { id: "discovery", label: "Discovery", icon: ClipboardList },
            { id: "readiness", label: "Readiness", icon: Target },
            { id: "services", label: "Services", icon: Bot },
            { id: "packages", label: "Packages", icon: Package },
            { id: "governance", label: "Governance", icon: Shield },
            { id: "documents", label: "Documents", icon: FileText },
            { id: "journey", label: "Customer Journey", icon: Workflow },
          ].map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  tab === t.id ? "bg-foreground text-background" : "text-muted-foreground bg-muted hover:bg-muted/70"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {t.label}
              </button>
            );
          })}
        </div>

        {tab === "overview" && <Overview />}
        {tab === "discovery" && <Discovery />}
        {tab === "readiness" && <Readiness />}
        {tab === "services" && <Services />}
        {tab === "packages" && <Packages />}
        {tab === "governance" && <Governance />}
        {tab === "documents" && <Documents />}
        {tab === "journey" && <Journey />}
      </main>
    </div>
  );
}

function Overview() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[
        { icon: ClipboardList, title: "Discovery Templates", desc: "Executive, company, technology, process, data, marketing, sales, AI-readiness.", count: DISCOVERY_TEMPLATES.length },
        { icon: Target, title: "AI Readiness Assessment", desc: `${READINESS_DIMENSIONS.length} dimensions scored from inputs.`, count: READINESS_DIMENSIONS.length },
        { icon: Bot, title: "Consulting Services", desc: "Strategy, Fractional CAIO, Automation, Agents, Knowledge, Data, Marketing, SEO, CRM, Comms, Custom.", count: CONSULTING_SERVICES.length },
        { icon: Package, title: "Commercial Packages", desc: "Strategy, Build, Scale, Enterprise — pricing configurable, never hard-coded.", count: CONSULTING_PACKAGES.length },
        { icon: FileText, title: "Document Generators", desc: "Discovery → proposal → SOW → QBR → offboarding.", count: CONSULTING_DOCUMENTS.length },
        { icon: Workflow, title: "Customer Journey", desc: "Lead → discovery → … → renewal → expansion.", count: CUSTOMER_JOURNEY.length },
      ].map((c) => {
        const Icon = c.icon;
        return (
          <div key={c.title} className="xa-card p-5">
            <div className="xa-icon-chip mb-3"><Icon className="w-5 h-5" /></div>
            <div className="font-heading font-bold text-sm text-foreground">{c.title}</div>
            <div className="text-xs text-muted-foreground mt-1">{c.desc}</div>
            <div className="text-[10px] font-bold text-[#0d2f96] mt-2">{c.count} templates</div>
          </div>
        );
      })}
    </div>
  );
}

function Discovery() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {DISCOVERY_TEMPLATES.map((d) => (
        <div key={d.id} className="xa-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <ClipboardList className="w-4 h-4 text-[#0d2f96]" />
            <span className="font-heading font-bold text-sm">{d.name}</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {d.fields.map((f) => (
              <span key={f} className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{f}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function Readiness() {
  const [answers, setAnswers] = useState({});
  const score = scoreReadiness(answers);
  return (
    <div className="space-y-4">
      <div className="xa-card p-5">
        <div className="font-heading font-bold text-sm mb-1">AI Readiness Assessment</div>
        <div className="text-xs text-muted-foreground mb-4">Score each dimension 0–5. Overall is computed — not invented.</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {READINESS_DIMENSIONS.map((dim) => (
            <div key={dim}>
              <label className="text-xs font-semibold text-muted-foreground capitalize">{dim.replace(/_/g, " ")}</label>
              <input
                type="range" min={0} max={5} value={answers[dim] || 0}
                onChange={(e) => setAnswers((a) => ({ ...a, [dim]: Number(e.target.value) }))}
                className="w-full accent-[#0059ff]"
              />
              <div className="text-[10px] font-mono text-muted-foreground">{answers[dim] || 0}/5</div>
            </div>
          ))}
        </div>
      </div>
      <div className="xa-card p-5 text-center">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Overall Readiness</div>
        <div className="font-heading font-black text-4xl text-foreground mt-1">{score.overall}<span className="text-lg text-muted-foreground">/5</span></div>
        <div className="text-xs text-muted-foreground mt-1">Computed from {READINESS_DIMENSIONS.length} scored dimensions.</div>
      </div>
    </div>
  );
}

function Services() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {CONSULTING_SERVICES.map((s) => (
        <div key={s.id} className="xa-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Bot className="w-4 h-4 text-[#0d2f96]" />
            <span className="font-heading font-bold text-sm">{s.name}</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {s.includes.map((f) => (
              <span key={f} className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{f}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function Packages() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
      {CONSULTING_PACKAGES.map((p, i) => (
        <div key={p.id} className={`xa-card p-5 ${i === 1 ? "border-[#0059ff] shadow-[0_0_14px_-6px_rgba(0,89,255,0.5)]" : ""}`}>
          {i === 1 && <span className="xa-pill-badge mb-2" style={{ fontSize: 9 }}>Most Popular</span>}
          <div className="font-heading font-black text-lg">{p.name}</div>
          <div className="text-xs text-muted-foreground mt-1 mb-3">Pricing: {p.pricing}</div>
          <ul className="space-y-1.5">
            {p.includes.map((inc) => (
              <li key={inc} className="text-xs text-muted-foreground flex items-start gap-1.5">
                <span className="text-[#0d2f96] mt-0.5">✓</span> {inc.replace(/_/g, " ")}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function Governance() {
  const sections = ["ai_usage_policy", "model_governance", "data_handling", "human_approval", "audit_trails", "agent_permissions", "tool_permissions", "customer_data_boundaries", "model_output_validation", "incident_response", "rollback", "escalation"];
  return (
    <div className="xa-card p-5">
      <div className="flex items-center gap-2 mb-3"><Shield className="w-4 h-4 text-[#0d2f96]" /><span className="font-heading font-bold text-sm">AI Governance Template</span></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {sections.map((s) => (
          <div key={s} className="flex items-center gap-2 text-xs xa-card xa-card-subtle px-3 py-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0d2f96]" />
            <span className="font-mono text-muted-foreground">{s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Documents() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
      {CONSULTING_DOCUMENTS.map((d) => (
        <div key={d} className="xa-card xa-card-subtle p-3 flex items-center gap-2">
          <FileText className="w-3.5 h-3.5 text-[#0d2f96]" />
          <span className="text-xs font-mono text-muted-foreground">{d}</span>
        </div>
      ))}
    </div>
  );
}

function Journey() {
  return (
    <div className="xa-card p-5">
      <div className="flex items-center gap-2 mb-4"><Workflow className="w-4 h-4 text-[#0d2f96]" /><span className="font-heading font-bold text-sm">Customer Journey States</span></div>
      <div className="flex flex-wrap items-center gap-2">
        {CUSTOMER_JOURNEY.map((stage, i) => (
          <React.Fragment key={stage}>
            {i > 0 && <span className="text-[#0d2f96] font-bold">→</span>}
            <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-muted text-foreground capitalize">{stage.replace(/_/g, " ")}</span>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}