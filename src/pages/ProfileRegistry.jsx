import React from "react";
import { useParams, Navigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Shield, ShieldCheck, Award, Server, Cpu, Rocket, DollarSign, Workflow } from "lucide-react";
import EntityListPage, { StatusPill } from "@/components/factory/EntityListPage.jsx";

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
  if (!fam) return <Navigate to="/capabilities" replace />;
  const Icon = fam.icon;
  return (
    <EntityListPage
      title={fam.label}
      subtitle={fam.subtitle}
      icon={Icon}
      badge="registry"
      load={() => base44.entities[entity].filter({}, { sort: "-created_date", limit: 100 })}
      columns={[
        { label: "Name", render: (r) => <span className="font-semibold">{r.name}</span> },
        { label: "Key", render: (r) => <span className="font-mono text-xs text-muted-foreground">{r[fam.keyField]}</span> },
        { label: "Version", field: "version", render: (r) => <span className="font-mono text-xs">v{r.version}</span> },
        { label: "Status", render: (r) => <StatusPill status={r.status} /> },
        { label: "Description", field: "description", render: (r) => <span className="text-xs text-muted-foreground truncate max-w-xs block">{r.description || "—"}</span> },
      ]}
      emptyTitle={`No ${fam.label.toLowerCase()} yet`}
      emptyHint="Create definitions in the studio or import from the registry."
    />
  );
}