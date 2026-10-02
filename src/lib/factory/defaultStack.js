// Default deploy stack for factory-generated systems.
// Backend: Supabase · Frontend: Vercel · Worker: Railway · Code: GitHub · Productivity: Google
export const DEFAULT_DEPLOY_STACK = {
  backend: { provider: "supabase", connector_id: "69e521c8418f5cecefb2567c", provisioning_template: "infra-supabase" },
  frontend: { provider: "vercel", provisioning_template: "infra-vercel-project" },
  worker: { provider: "railway", provisioning_template: "infra-railway-worker" },
  code: { provider: "github", connector_id: "6ab15ad1cf868907e918178e", provisioning_template: "infra-github-repo" },
  google: {
    provider: "google_workspace",
    connectors: { drive: "69db1e5e75a5f8c15c80cf34", sheets: "69db1fad3c50db37ad0ce8dd" },
  },
};

export const DEFAULT_DEPLOY_STACK_SUMMARY = "Supabase (backend) · Vercel (frontend) · Railway (worker) · GitHub (code) · Google (workspace)";