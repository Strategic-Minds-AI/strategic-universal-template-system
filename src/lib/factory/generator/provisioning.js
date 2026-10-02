// Provisioning engine — plan-first, approval-gated, no live mutation.
// Produces: current_state → desired_state → diff → actions → risks →
// credential_requirements → rollback. Live protected changes stay operator-gated.
import { provisioningTemplates, findProvisioningTemplate } from "./registry.js";

// Build a provisioning plan from a template + desired-state input.
export function buildProvisioningPlan({ template_id, project_id, current_state, desired_state, input }) {
  const tmpl = findProvisioningTemplate(template_id);
  if (!tmpl) {
    return { error: `Unknown provisioning template: ${template_id}`, available: provisioningTemplates.map((t) => t.id) };
  }
  const diff = computeDiff(current_state || {}, desired_state || {});
  const actions = diffToActions(diff, template_id);
  const risk_summary = summarizeRisk(actions);
  const credential_requirements = credentialReqs(template_id);
  const rollback = buildRollback(actions, template_id);

  return {
    template_id,
    template_version: tmpl.version,
    mode: tmpl.mode || "plan-first",
    dry_run: true,
    current_state: current_state || {},
    desired_state: desired_state || {},
    diff,
    actions,
    risk_summary,
    credential_requirements,
    rollback,
    live_execution_requires_approval: tmpl.live_execution_requires_approval !== false,
    status: "draft",
  };
}

export function computeDiff(current, desired) {
  const deltas = [];
  const keys = new Set([...Object.keys(current), ...Object.keys(desired)]);
  for (const k of keys) {
    const c = current[k], d = desired[k];
    if (JSON.stringify(c) === JSON.stringify(d)) continue;
    if (c === undefined) deltas.push({ op: "create", key: k, value: d });
    else if (d === undefined) deltas.push({ op: "remove", key: k, was: c });
    else deltas.push({ op: "update", key: k, was: c, value: d });
  }
  return deltas;
}

function diffToActions(diff, template_id) {
  return diff.map((d) => ({
    action_key: `${template_id}.${d.op}.${d.key}`,
    op: d.op,
    key: d.key,
    value: d.value,
    risk_class: riskForOp(d.op),
    requires_approval: d.op !== "create" || isProtected(template_id, d.key),
    idempotent: d.op === "create" ? false : true,
  }));
}

function riskForOp(op) {
  if (op === "remove") return "PROTECTED";
  if (op === "update") return "BRANCH_WRITE";
  return "DRAFT";
}

function isProtected(template_id, key) {
  const protectedKeys = ["rls", "secrets", "dns", "domain", "production", "payments", "permissions"];
  return protectedKeys.some((p) => key.toLowerCase().includes(p));
}

function summarizeRisk(actions) {
  const counts = { PROTECTED: 0, BRANCH_WRITE: 0, DRAFT: 0, READ: 0 };
  for (const a of actions) counts[a.risk_class] = (counts[a.risk_class] || 0) + 1;
  return {
    max_risk: counts.PROTECTED ? "PROTECTED" : counts.BRANCH_WRITE ? "BRANCH_WRITE" : "DRAFT",
    counts,
    requires_operator_approval: counts.PROTECTED > 0 || counts.BRANCH_WRITE > 0,
  };
}

function credentialReqs(template_id) {
  const map = {
    "github-repo": [{ ref: "GITHUB_TOKEN", scope: "repo" }],
    "github-branch-policy": [{ ref: "GITHUB_TOKEN", scope: "repo:admin" }],
    "vercel-project": [{ ref: "VERCEL_TOKEN", scope: "project" }],
    "vercel-preview": [{ ref: "VERCEL_TOKEN", scope: "project" }],
    "supabase-project": [{ ref: "SUPABASE_SERVICE_KEY", scope: "admin" }, { ref: "SUPABASE_REF" }],
    "supabase-schema": [{ ref: "SUPABASE_SERVICE_KEY", scope: "admin" }],
    "supabase-storage": [{ ref: "SUPABASE_SERVICE_KEY", scope: "admin" }],
    "supabase-auth": [{ ref: "SUPABASE_SERVICE_KEY", scope: "admin" }],
    "railway-service": [{ ref: "RAILWAY_TOKEN", scope: "service" }],
    "google-drive": [{ ref: "GOOGLE_DRIVE_TOKEN", scope: "drive" }],
  };
  return map[template_id] || [];
}

function buildRollback(actions, template_id) {
  return {
    template_id,
    steps: actions
      .filter((a) => a.op !== "remove")
      .reverse()
      .map((a) => ({
        action_key: `rollback.${a.action_key}`,
        op: a.op === "create" ? "remove" : "update",
        key: a.key,
        was: a.op === "create" ? null : a.value,
      })),
    note: "Rollback restores prior state. Protected operations require separate approval.",
  };
}