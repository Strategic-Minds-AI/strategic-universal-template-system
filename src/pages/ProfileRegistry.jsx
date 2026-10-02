import React, { useState, useEffect, useMemo } from "react";
import { useParams, Navigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Shield, ShieldCheck, Award, Server, Cpu, Rocket, DollarSign, Workflow, Search, RefreshCw, Loader2 } from "lucide-react";
import { PREVIEW_STYLES } from "@/lib/gallery/previewStyles.js";
import { loadConfig, themeToCssVars } from "@/lib/gallery/studioConfig.js";
import VisualizerCard from "@/components/visualizer/VisualizerCard.jsx";

export const PROFILE_FAMILIES = {
  PolicyDefinition: { label: "Policy Definitions", icon: Shield, keyField: "policy_key", subtitle: "Governance policies — approval gates, protected-action boundaries, rollback rules." },
  ValidationProfile: { label: "Validation Profiles", icon: ShieldCheck, keyField: "profile_key", subtitle: "Validation layer bundles — mandatory gates and evidence requirements." },
  QualityProfile: { label: "Quality Profiles", icon: Award, keyField: "profile_key", subtitle: "Quality compiler profiles — pass counts and aesthetic guardrails." },
  ProvisioningProfile: { label: "Provisioning Profiles", icon: Server, keyField: "profile_key", subtitle: "Provisioning templates — plan-first, dry-run, approval-gated." },
  RuntimeProfile: { label: "Runtime Profiles", icon: Cpu, keyField: "profile_key", subtitle: "Runtime configurations — limits, timeouts, concurrency." },
  ReleaseProfile: { label: "Release Profiles", icon: Rocket, keyField: "profile_key", subtitle: "Release gates — freeze, export, handoff, rollback." },
  MonetizationProfile: { label: "Monetization Profiles", icon: DollarSign, keyField: "profile_key", subtitle: "Monetization schemas — subscriptions, seats, usage, credits." },
  WorkflowDefinition: { label: "Workflow Definitions", icon: Workflow, keyField: "workflow_key", subtitle: "Reusable workflow DAGs — triggers, steps, branching." },
};

export default function ProfileRegistry() {
  const { entity } = useParams();
  const fam = PROFILE_FAMILIES[entity];
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [query, setQuery] = useState("");
  const config = loadConfig();
  const themeVars = useMemo(() => themeToCssVars(config), []);

  const reload = async () => {
    if (!fam) return;
    setLoading(true); setErr("");
    try {
      const page = await base44.entities[entity].filter({}, { sort: "-created_date", limit: 100 });
      setItems(page.items || []);
    } catch (e) { setErr(e?.message || "load failed"); }
    finally { setLoading(false); }
  };
  useEffect(() => { reload(); }, [entity]);

  const filtered = useMemo(() => {
    if (!fam) return items;
    if (!query) return items;
    const q = query.toLowerCase();
    return items.filter((r) => (r.name || "").toLowerCase().includes(q) || (r[fam.keyField] || "").toLowerCase().includes(q));
  }, [items, query, fam]);

  if (!fam) return <Navigate to="/capabilities" replace />;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <style>{PREVIEW_STYLES}</style>
      <div className="flex items-center justify-between mb-5 gap-4 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <div className="xa-icon-chip shrink-0"><fam.icon className="w-5 h-5" /></div>
          <div className="min-w-0">
            <h1 className="text-xl font-black font-heading flex items-center gap-2">{fam.label} <span className="xa-pill-badge" style={{ fontSize: 10 }}>registry</span></h1>
            <p className="text-sm text-muted-foreground mt-0.5">{fam.subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Filter…" className="pl-8 pr-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring w-44" />
          </div>
          <button onClick={reload} className="p-2 rounded-lg border border-input hover:bg-muted" title="Reload"><RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /></button>
        </div>
      </div>

      {loading ? (
        <div className="xa-card p-6 text-center text-sm flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Loading…</div>
      ) : err ? (
        <div className="xa-card p-6 text-center text-sm text-red-600">{err}</div>
      ) : filtered.length === 0 ? (
        <div className="xa-card xa-card-subtle p-12 text-center"><div className="text-sm font-semibold">No {fam.label.toLowerCase()} yet</div><div className="text-xs text-muted-foreground mt-1">Create definitions in the studio or import from the registry.</div></div>
      ) : (
        <div style={themeVars} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((r) => (
            <VisualizerCard key={r.id} title={r.name} keyField={r[fam.keyField]} status={r.status} version={r.version} record={r} entityName={entity} subtitle={r.description} />
          ))}
        </div>
      )}
    </div>
  );
}