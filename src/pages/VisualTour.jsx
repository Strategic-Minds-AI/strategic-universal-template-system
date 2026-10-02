import React from "react";
import { Link } from "react-router-dom";
import { Boxes, Library, Terminal, ShieldCheck, Server, Sparkles, ArrowRight } from "lucide-react";
import GeneratorsRender from "@/components/sectionRenders/GeneratorsRender";
import RegistriesRender from "@/components/sectionRenders/RegistriesRender";
import ExecutionRender from "@/components/sectionRenders/ExecutionRender";
import QualityRender from "@/components/sectionRenders/QualityRender";
import OperationsRender from "@/components/sectionRenders/OperationsRender";

const SECTIONS = [
  {
    key: "generators",
    title: "Generators",
    icon: Boxes,
    render: GeneratorsRender,
    pages: [{ label: "Library", to: "/generators" }, { label: "Studio", to: "/studio" }],
    desc: "Browse the generator library, inspect workflow DAGs, and create new versioned generators — manually or with AI.",
    flow: "Pick a generator → configure inputs → the DAG orchestrates validate, render, AI-generate, checksum, and export steps.",
  },
  {
    key: "registries",
    title: "Registries",
    icon: Library,
    render: RegistriesRender,
    pages: [{ label: "Templates", to: "/templates" }, { label: "Profiles", to: "/registry/QualityProfile" }, { label: "Adapters", to: "/adapters" }, { label: "Capabilities", to: "/capabilities" }],
    desc: "Every profile type — quality, validation, provisioning, release, runtime, monetization — is a versioned first-class data model.",
    flow: "Draft → validated → approved → frozen. Each version is SHA-256 verified and rollback-ready.",
  },
  {
    key: "execution",
    title: "Execution",
    icon: Terminal,
    render: ExecutionRender,
    pages: [{ label: "Run Console", to: "/runs" }, { label: "Artifacts", to: "/artifacts" }],
    desc: "Watch generator runs execute step-by-step through the DAG, then explore the validated artifact packet.",
    flow: "Run starts → steps execute in DAG order → artifacts are checksummed → packet is exported immutable.",
  },
  {
    key: "quality",
    title: "Quality",
    icon: ShieldCheck,
    render: QualityRender,
    pages: [{ label: "Validation", to: "/validation" }, { label: "Repair", to: "/repair" }],
    desc: "Independent validators check every layer — schema, lint, typecheck, security, integrity. Failures auto-repair.",
    flow: "Validation runs → failures classified by layer → repair tasks target the failing step → re-validate.",
  },
  {
    key: "operations",
    title: "Operations",
    icon: Server,
    render: OperationsRender,
    pages: [{ label: "Provisioning", to: "/provisioning" }, { label: "Approvals", to: "/approvals" }, { label: "Audit", to: "/audit" }, { label: "Usage", to: "/usage" }],
    desc: "Plan-first provisioning with dry-run diffs, approval gates, audit receipts, and usage budgets.",
    flow: "Dry-run diff → approval gate → execute → verify → rollback-ready. Every action is audited.",
  },
];

export default function VisualTour() {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-2">
        <div className="xa-icon-chip"><Sparkles className="w-5 h-5" /></div>
        <div>
          <h1 className="text-2xl font-black font-heading">Visual Tour</h1>
          <p className="text-sm text-muted-foreground mt-0.5">See exactly what every section of the factory does — from a user's perspective.</p>
        </div>
      </div>

      <div className="space-y-6 mt-6">
        {SECTIONS.map((s, idx) => {
          const Render = s.render;
          return (
            <div key={s.key} className="xa-card overflow-hidden">
              <div className="grid lg:grid-cols-5 gap-0">
                {/* Description */}
                <div className="lg:col-span-2 p-5 lg:p-6 flex flex-col">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] font-mono font-bold text-muted-foreground">0{idx + 1}</span>
                    <div className="xa-icon-chip" style={{ width: 32, height: 32, borderRadius: 8 }}><s.icon className="w-4 h-4" /></div>
                    <h2 className="text-lg font-black font-heading">{s.title}</h2>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{s.desc}</p>
                  <div className="rounded-lg bg-muted/40 p-3 mb-4">
                    <div className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">User flow</div>
                    <p className="text-xs text-foreground leading-relaxed">{s.flow}</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-auto">
                    {s.pages.map((p) => (
                      <Link key={p.to} to={p.to} className="xa-btn-outline text-xs" style={{ padding: "6px 12px" }}>
                        {p.label} <ArrowRight className="w-3 h-3" />
                      </Link>
                    ))}
                  </div>
                </div>
                {/* Visual render */}
                <div className="lg:col-span-3 p-5 lg:p-6 bg-gradient-to-br from-muted/20 to-transparent flex items-center">
                  <div className="w-full"><Render height={300} /></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="xa-card p-5 mt-6 border-amber-200">
        <div className="flex items-start gap-3">
          <Sparkles className="w-4 h-4 text-[#0d2f96] shrink-0 mt-0.5" />
          <div className="text-xs text-muted-foreground">
            <strong className="text-foreground">Fresh purpose-built renders:</strong> Each visual above is a hand-built mockup of that section's actual UI —
            not a screenshot, but a faithful illustration of what you'll see when you open the page. Click any section's page links to jump to the live version.
          </div>
        </div>
      </div>
    </div>
  );
}