// Adapter registry — frontend view. Each adapter declares capabilities, actions,
// risk classes, and a NOT_CONFIGURED health state when credentials are missing.
// External writes NEVER fake success; unconfigured adapters return NOT_CONFIGURED.
import { RISK_CLASSES } from "./registry.js";

export const ADAPTERS = [
  {
    adapter_key: "ai-gateway",
    name: "Vercel AI Gateway",
    capabilities: ["ai_generate", "ai_evaluate", "embeddings"],
    actions: [
      { name: "generate", risk_class: "READ", idempotent: false, requires_approval: false },
      { name: "evaluate", risk_class: "READ", idempotent: false, requires_approval: false },
      { name: "embed", risk_class: "READ", idempotent: true, requires_approval: false },
    ],
    secret_references: ["VERCEL_AI_GATEWAY_KEY"],
    health_state: "healthy",
    config_schema: { type: "object", properties: { provider: { type: "string", enum: ["vercel"] }, model: { type: "string" } } },
  },
  {
    adapter_key: "http-api",
    name: "HTTP / API",
    capabilities: ["http_request"],
    actions: [{ name: "request", risk_class: "READ", idempotent: true, requires_approval: false }],
    secret_references: [],
    health_state: "not_configured",
    config_schema: { type: "object", properties: { baseUrl: { type: "string" } } },
  },
  {
    adapter_key: "github",
    name: "GitHub",
    capabilities: ["repo_create", "branch_create", "pr_create", "content_write"],
    actions: [
      { name: "repo_create", risk_class: "BRANCH_WRITE", idempotent: false, requires_approval: true },
      { name: "branch_create", risk_class: "BRANCH_WRITE", idempotent: true, requires_approval: true },
      { name: "pr_create", risk_class: "BRANCH_WRITE", idempotent: false, requires_approval: true },
      { name: "content_write", risk_class: "PROTECTED", idempotent: false, requires_approval: true },
    ],
    secret_references: ["GITHUB_TOKEN"],
    health_state: "not_configured",
    config_schema: { type: "object", required: ["token"], properties: { token: { type: "string" }, owner: { type: "string" } } },
  },
  {
    adapter_key: "supabase",
    name: "Supabase",
    capabilities: ["project_admin", "schema_apply", "storage_admin", "auth_admin"],
    actions: [
      { name: "schema_apply", risk_class: "PROTECTED", idempotent: true, requires_approval: true },
      { name: "storage_admin", risk_class: "PROTECTED", idempotent: false, requires_approval: true },
      { name: "auth_admin", risk_class: "PROTECTED", idempotent: false, requires_approval: true },
    ],
    secret_references: ["SUPABASE_SERVICE_KEY", "SUPABASE_REF"],
    health_state: "not_configured",
    config_schema: { type: "object", required: ["ref", "serviceKey"], properties: { ref: { type: "string" }, serviceKey: { type: "string" } } },
  },
  {
    adapter_key: "vercel",
    name: "Vercel",
    capabilities: ["project_create", "env_set", "domain_set", "deploy"],
    actions: [
      { name: "project_create", risk_class: "BRANCH_WRITE", idempotent: false, requires_approval: true },
      { name: "env_set", risk_class: "PROTECTED", idempotent: true, requires_approval: true },
      { name: "domain_set", risk_class: "PROTECTED", idempotent: false, requires_approval: true },
      { name: "deploy", risk_class: "PROTECTED", idempotent: false, requires_approval: true },
    ],
    secret_references: ["VERCEL_TOKEN"],
    health_state: "not_configured",
    config_schema: { type: "object", required: ["token"], properties: { token: { type: "string" }, teamId: { type: "string" } } },
  },
  {
    adapter_key: "railway",
    name: "Railway",
    capabilities: ["service_create", "env_set", "deploy"],
    actions: [
      { name: "service_create", risk_class: "BRANCH_WRITE", idempotent: false, requires_approval: true },
      { name: "env_set", risk_class: "PROTECTED", idempotent: true, requires_approval: true },
      { name: "deploy", risk_class: "PROTECTED", idempotent: false, requires_approval: true },
    ],
    secret_references: ["RAILWAY_TOKEN"],
    health_state: "not_configured",
    config_schema: { type: "object", required: ["token"], properties: { token: { type: "string" } } },
  },
  {
    adapter_key: "google-drive",
    name: "Google Drive",
    capabilities: ["folder_create", "file_write", "share"],
    actions: [
      { name: "folder_create", risk_class: "BRANCH_WRITE", idempotent: true, requires_approval: true },
      { name: "file_write", risk_class: "BRANCH_WRITE", idempotent: false, requires_approval: true },
      { name: "share", risk_class: "PROTECTED", idempotent: false, requires_approval: true },
    ],
    secret_references: ["GOOGLE_DRIVE_TOKEN"],
    health_state: "not_configured",
    config_schema: { type: "object", required: ["token"], properties: { token: { type: "string" } } },
  },
  {
    adapter_key: "base44-internal",
    name: "Base44 Internal (data/functions)",
    capabilities: ["entity_read", "entity_write", "function_invoke"],
    actions: [
      { name: "entity_read", risk_class: "READ", idempotent: true, requires_approval: false },
      { name: "entity_write", risk_class: "DRAFT", idempotent: false, requires_approval: false },
      { name: "function_invoke", risk_class: "READ", idempotent: false, requires_approval: false },
    ],
    secret_references: [],
    health_state: "healthy",
    config_schema: { type: "object", properties: {} },
  },
  {
    adapter_key: "sandbox",
    name: "Sandbox / Code Execution",
    capabilities: ["code_execute", "test_run", "build"],
    actions: [
      { name: "code_execute", risk_class: "DRAFT", idempotent: false, requires_approval: false },
      { name: "test_run", risk_class: "READ", idempotent: true, requires_approval: false },
      { name: "build", risk_class: "DRAFT", idempotent: false, requires_approval: false },
    ],
    secret_references: ["SANDBOX_ENDPOINT"],
    health_state: "not_configured",
    config_schema: { type: "object", required: ["endpoint"], properties: { endpoint: { type: "string" }, cpu: { type: "number" }, memory: { type: "number" }, timeout: { type: "number" } } },
  },
  {
    adapter_key: "file-archive",
    name: "File / Archive",
    capabilities: ["zip", "checksum", "extract"],
    actions: [
      { name: "zip", risk_class: "READ", idempotent: true, requires_approval: false },
      { name: "checksum", risk_class: "READ", idempotent: true, requires_approval: false },
      { name: "extract", risk_class: "READ", idempotent: true, requires_approval: false },
    ],
    secret_references: [],
    health_state: "healthy",
    config_schema: { type: "object", properties: {} },
  },
  {
    adapter_key: "email",
    name: "Email / Message (disabled by default)",
    capabilities: ["send_email"],
    actions: [{ name: "send_email", risk_class: "PROTECTED", idempotent: true, requires_approval: true }],
    secret_references: ["SMTP_CONFIG"],
    health_state: "disabled",
    config_schema: { type: "object", required: ["smtp"], properties: { smtp: { type: "string" } } },
  },
];

export function findAdapter(key) {
  return ADAPTERS.find((a) => a.adapter_key === key);
}

export function adapterHealthSummary() {
  return ADAPTERS.map((a) => ({
    adapter_key: a.adapter_key,
    name: a.name,
    health_state: a.health_state,
    configured: a.health_state === "healthy",
    action_count: a.actions.length,
    protected_actions: a.actions.filter((x) => x.risk_class === "PROTECTED").length,
  }));
}

// Build a NOT_CONFIGURED result for an unconfigured adapter action.
export function notConfigured(adapterKey, actionName, missing) {
  return {
    status: "NOT_CONFIGURED",
    adapter: adapterKey,
    action: actionName,
    health_state: "not_configured",
    missing,
    message: `Adapter "${adapterKey}" action "${actionName}" is not configured. Required: ${missing.join(", ")}.`,
    instructions: `Provide the required configuration and secret references to enable this adapter. No fake success is returned.`,
  };
}

export { RISK_CLASSES };