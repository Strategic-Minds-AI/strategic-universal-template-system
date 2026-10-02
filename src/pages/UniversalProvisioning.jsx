import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Server, Database, Rocket, Github, Train, Globe, Layers, Loader2, ClipboardList, AlertTriangle, CheckCircle2 } from "lucide-react";
import ProviderCredentialCard from "@/components/factory/ProviderCredentialCard.jsx";
import { StatusPill } from "@/components/factory/EntityListPage.jsx";

// The 5 universal provisioning providers. Secret VALUES are declared via set_secrets
// and entered in the dashboard Secrets page; these boxes store non-secret config.
const PROVISIONING_PROVIDERS = [
  {
    key: "supabase", adapter_key: "supabase", name: "Supabase", version: "1.0.0", Icon: Database,
    capabilities: ["project_admin", "schema_apply", "storage_admin", "auth_admin"],
    help: "Provision Supabase projects, schemas, storage and auth. Uses the Personal Access Token (PAT) from supabase.com → Account → Access Tokens — NOT the service_role key, which only reads/writes data inside an existing project.",
    config_fields: [{ key: "ref", label: "Project Ref (optional, for existing project)", required: false, placeholder: "abcdefghijklmnop" }],
    secret_references: ["SUPABASE_ACCESS_TOKEN"],
  },
  {
    key: "vercel", adapter_key: "vercel", name: "Vercel", version: "1.0.0", Icon: Rocket,
    capabilities: ["project_create", "env_set", "domain_set", "deploy"],
    help: "Provision Vercel projects, environment variables, custom domains and production deploys.",
    config_fields: [{ key: "teamId", label: "Team ID (optional)", required: false, placeholder: "team_xxx" }],
    secret_references: ["VERCEL_TOKEN"],
  },
  {
    key: "github", adapter_key: "github", name: "GitHub", version: "1.0.0", Icon: Github,
    capabilities: ["repo_create", "branch_create", "pr_create", "content_write"],
    help: "Provision GitHub repositories, branches, pull requests and content writes.",
    config_fields: [{ key: "owner", label: "Owner / Org", required: true, placeholder: "your-org" }],
    secret_references: ["GITHUB_TOKEN"],
  },
  {
    key: "railway", adapter_key: "railway", name: "Railway", version: "1.0.0", Icon: Train,
    capabilities: ["service_create", "env_set", "deploy"],
    help: "Provision Railway services, environment variables and deploys.",
    config_fields: [{ key: "serviceName", label: "Service name (optional)", required: false, placeholder: "api" }],
    secret_references: ["RAILWAY_TOKEN"],
  },
  {
    key: "google", adapter_key: "google", name: "Google", version: "1.0.0", Icon: Globe,
    capabilities: ["search_console", "ga4", "drive", "cloud"],
    help: "Provision Google Cloud, Search Console, GA4 and Drive resources.",
    config_fields: [{ key: "projectId", label: "Google Cloud Project ID (optional)", required: false, placeholder: "my-project-123" }],
    secret_references: ["GOOGLE_TOKEN"],
  },
];

export default function UniversalProvisioning() {
  const [existing, setExisting] = useState({}); // adapter_key -> AdapterDefinition record
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState({ supabase: true, vercel: true, github: true, railway: false, google: false });
  const [planName, setPlanName] = useState("");
  const [repoName, setRepoName] = useState("");
  const [domain, setDomain] = useState("");
  const [generating, setGenerating] = useState(false);
  const [lastPlan, setLastPlan] = useState(null);
  const [plans, setPlans] = useState([]);

  const loadExisting = async () => {
    setLoading(true);
    try {
      const keys = PROVISIONING_PROVIDERS.map((p) => p.adapter_key);
      const page = await base44.entities.AdapterDefinition.filter({ adapter_key: { $in: keys } }, { limit: 50 });
      const map = {};
      (page.items || []).forEach((r) => { map[r.adapter_key] = r; });
      setExisting(map);
    } catch { /* best-effort */ } finally { setLoading(false); }
  };

  const loadPlans = async () => {
    try {
      const page = await base44.entities.ProvisioningPlan.filter({}, { sort: "-created_date", limit: 6 });
      setPlans(page.items || []);
    } catch { /* best-effort */ }
  };

  useEffect(() => { loadExisting(); loadPlans(); }, []);

  const onSaved = (key, payload) => {
    setExisting((m) => ({ ...m, [key]: { ...(m[key] || {}), ...payload, id: m[key]?.id } }));
  };

  const toggleProvider = (k) => setSelected((s) => ({ ...s, [k]: !s[k] }));

  const readyProviders = PROVISIONING_PROVIDERS.filter((p) => existing[p.adapter_key]?.health_state === "healthy");
  const selectedProviders = PROVISIONING_PROVIDERS.filter((p) => selected[p.key]);
  const selectedReady = selectedProviders.filter((p) => existing[p.adapter_key]?.health_state === "healthy");
  const selectedNotReady = selectedProviders.filter((p) => existing[p.adapter_key]?.health_state !== "healthy");

  const generatePlan = async () => {
    setGenerating(true); setLastPlan(null);
    try {
      const actions = [];
      const credentialRequirements = [];
      selectedProviders.forEach((p) => {
        const cfg = existing[p.adapter_key]?.config_status || {};
        p.capabilities.forEach((cap) => {
          actions.push({ provider: p.adapter_key, action: cap, risk_class: cap.includes("create") ? "BRANCH_WRITE" : "PROTECTED", target: cfg.ref || cfg.owner || cfg.projectId || cfg.teamId || "new" });
        });
        p.secret_references.forEach((s) => credentialRequirements.push({ adapter: p.adapter_key, secret: s, provided: existing[p.adapter_key]?.config_status?.secrets_provided?.[s] }));
      });
      const desiredState = { project_name: planName, repo_name: repoName, domain, providers: selectedProviders.map((p) => p.adapter_key) };
      const riskSummary = { protected_actions: actions.filter((a) => a.risk_class === "PROTECTED").length, missing_credentials: credentialRequirements.filter((c) => !c.provided).length };
      const rollback = selectedProviders.map((p) => ({ provider: p.adapter_key, rollback_action: `delete/${p.adapter_key}_resources` }));
      const plan = {
        project_id: `prov-${Date.now()}`,
        template_id: "universal-provisioning-v1",
        plan: { desired_state: desiredState, actions, credential_requirements: credentialRequirements, risk_summary: riskSummary, rollback },
        current_state: { configured_providers: readyProviders.map((p) => p.adapter_key) },
        desired_state: desiredState,
        diff: actions,
        actions,
        risk_summary: riskSummary,
        credential_requirements: credentialRequirements,
        rollback,
        status: "draft",
        dry_run: true,
      };
      const created = await base44.entities.ProvisioningPlan.create(plan);
      setLastPlan(created);
      loadPlans();
    } catch (e) {
      setLastPlan({ error: e?.message || "Plan generation failed" });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <div className="xa-icon-chip"><Server className="w-5 h-5" /></div>
        <div className="min-w-0">
          <h1 className="text-xl font-black font-heading flex items-center gap-2">Universal Provisioning <span className="xa-pill-badge" style={{ fontSize: 9, padding: "2px 8px" }}>v1.0</span></h1>
          <p className="text-xs text-muted-foreground mt-0.5">One system to provision infrastructure across Supabase, Vercel, GitHub, Railway and Google — plan-first, approval-gated, dry-run by default.</p>
        </div>
      </div>

      {/* Section 1: credential boxes */}
      <div className="flex items-center gap-2 mb-2.5">
        <Layers className="w-3.5 h-3.5 text-[#CCBB00]" />
        <h2 className="text-xs font-bold uppercase tracking-wide">Provider Credentials</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-5">
        {PROVISIONING_PROVIDERS.map((p) => (
          <ProviderCredentialCard key={p.key} provider={p} existing={existing[p.adapter_key]} onSaved={onSaved} />
        ))}
      </div>

      {/* Section 2: provisioning plan builder */}
      <div className="xa-card p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <ClipboardList className="w-3.5 h-3.5 text-[#CCBB00]" />
          <h2 className="text-xs font-bold uppercase tracking-wide">Provisioning Plan Builder (dry-run)</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-3 mb-3">
          <div>
            <label className="text-[11px] font-semibold">Project name</label>
            <input value={planName} onChange={(e) => setPlanName(e.target.value)} placeholder="my-saas-app" className="w-full mt-1 h-9 px-3 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div>
            <label className="text-[11px] font-semibold">Repo name</label>
            <input value={repoName} onChange={(e) => setRepoName(e.target.value)} placeholder="my-saas-app" className="w-full mt-1 h-9 px-3 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div>
            <label className="text-[11px] font-semibold">Domain</label>
            <input value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="myapp.com" className="w-full mt-1 h-9 px-3 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
        </div>

        <div className="text-[11px] font-semibold mb-2">Target providers</div>
        <div className="flex flex-wrap gap-2 mb-3">
          {PROVISIONING_PROVIDERS.map((p) => {
            const ready = existing[p.adapter_key]?.health_state === "healthy";
            return (
              <button key={p.key} onClick={() => toggleProvider(p.key)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                  selected[p.key] ? "bg-[#FFEA00] text-black border-transparent" : "bg-background text-muted-foreground border-border hover:text-foreground"
                }`}>
                <p.Icon className="w-3.5 h-3.5" />
                {p.name}
                {ready ? <CheckCircle2 className="w-3 h-3 text-black/60" /> : <AlertTriangle className="w-3 h-3 text-amber-500" />}
              </button>
            );
          })}
        </div>

        {selectedNotReady.length > 0 && (
          <div className="flex items-start gap-2 text-[11px] text-amber-700 bg-amber-50 rounded-lg p-2.5 mb-3">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span>{selectedNotReady.map((p) => p.name).join(", ")} not fully configured — plan generates but execution stays NOT_CONFIGURED until credentials and secrets are set.</span>
          </div>
        )}

        <button onClick={generatePlan} disabled={generating || selectedProviders.length === 0} className="xa-btn-primary text-xs" style={{ padding: "9px 14px" }}>
          {generating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ClipboardList className="w-3.5 h-3.5" />}
          {generating ? "Generating…" : "Generate dry-run plan"}
        </button>

        {lastPlan && !lastPlan.error && (
          <div className="mt-3 rounded-lg border border-border bg-muted/40 p-3">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span className="text-xs font-bold">Plan created — dry-run, no live mutation</span>
              <span className="font-mono text-[10px] text-muted-foreground ml-auto">{lastPlan.id?.slice(0, 12)}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-[11px] mb-2">
              <div><span className="text-muted-foreground">Actions:</span> <span className="font-bold">{lastPlan.actions?.length}</span></div>
              <div><span className="text-muted-foreground">Protected:</span> <span className="font-bold text-amber-600">{lastPlan.risk_summary?.protected_actions}</span></div>
              <div><span className="text-muted-foreground">Missing creds:</span> <span className="font-bold text-red-600">{lastPlan.risk_summary?.missing_credentials}</span></div>
            </div>
            <div className="text-[10px] text-muted-foreground">Providers: {lastPlan.desired_state?.providers?.join(" · ")}</div>
          </div>
        )}
        {lastPlan?.error && <div className="text-[11px] text-red-600 mt-2">{lastPlan.error}</div>}
      </div>

      {/* Recent plans */}
      <div className="xa-card p-4">
        <h2 className="text-xs font-bold uppercase tracking-wide mb-3">Recent Plans</h2>
        {plans.length === 0 ? (
          <div className="text-xs text-muted-foreground py-4 text-center">No plans yet. Generate one above.</div>
        ) : (
          <div className="space-y-1.5">
            {plans.map((pl) => (
              <div key={pl.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                <div className="min-w-0">
                  <div className="text-xs font-semibold truncate">{pl.desired_state?.project_name || pl.template_id}</div>
                  <div className="text-[10px] font-mono text-muted-foreground">{pl.id.slice(0, 12)} · {(pl.desired_state?.providers || []).join(", ")}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-amber-600">{pl.dry_run ? "DRY-RUN" : "LIVE"}</span>
                  <StatusPill status={pl.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="xa-card p-3 mt-4 border-amber-200">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
          <div className="text-[11px]">
            <span className="font-bold">Live execution: NOT_CONFIGURED</span>
            <span className="text-muted-foreground block mt-0.5">Secret values (SUPABASE_ACCESS_TOKEN, VERCEL_TOKEN, GITHUB_TOKEN, RAILWAY_TOKEN, GOOGLE_TOKEN) must be added in the dashboard Secrets page, and integration credits are exhausted until 2026-10-12. Dry-run plans generate fully; live provisioning re-enables when both are resolved.</span>
          </div>
        </div>
      </div>
    </div>
  );
}