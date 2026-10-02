// Seed definitions — builds real GeneratorDefinition objects for all 60
// generator types, 34 AI consulting generators, and 30 provisioning templates.
// Each has a real workflow_dag with deterministic nodes. AI/external nodes
// honestly declare NOT_CONFIGURED behavior; they are not faked.
import { generatorTypes, aiConsultingTemplates, provisioningTemplates } from "./registry.js";

const SEMVER = "1.0.0";

// A minimal but real DAG: validate input → render template → validate output → checksum → export.
function standardDag({ templateMode = "text", outputFields = ["title", "body"], extraNodes = [] }) {
  const nodes = [
    { id: "validate_input", type: "validate_schema", config: { schema_ref: "input_schema" } },
    { id: "render", type: "template", config: { mode: templateMode, output: "body" } },
    { id: "validate_output", type: "validate_content", config: { required: outputFields } },
    { id: "checksum", type: "checksum", config: {} },
    { id: "export", type: "export", config: {} },
    ...extraNodes,
  ];
  const edges = [
    { from: "validate_input", to: "render" },
    { from: "render", to: "validate_output" },
    { from: "validate_output", to: "checksum" },
    { from: "checksum", to: "export" },
  ];
  extraNodes.forEach((n, i) => {
    if (i === 0) edges.push({ from: "export", to: n.id });
    else edges.push({ from: extraNodes[i - 1].id, to: n.id });
  });
  return { nodes, edges };
}

function consultingDag() {
  // Evidence-based: unknowns stay unknown. No fabricated ROI/scores.
  return {
    nodes: [
      { id: "validate_input", type: "validate_schema", config: { schema_ref: "input_schema" } },
      { id: "assess", type: "template", config: { mode: "document", output: "body", evidence_required: true, unknowns_blank: true } },
      { id: "validate_completeness", type: "validate_content", config: { required: ["summary", "findings", "unknowns"] } },
      { id: "secret_scan", type: "validate_security", config: {} },
      { id: "checksum", type: "checksum", config: {} },
      { id: "export", type: "export", config: {} },
    ],
    edges: [
      { from: "validate_input", to: "assess" },
      { from: "assess", to: "validate_completeness" },
      { from: "validate_completeness", to: "secret_scan" },
      { from: "secret_scan", to: "checksum" },
      { from: "checksum", to: "export" },
    ],
  };
}

function provisioningDag() {
  // Plan-first, approval-gated, no live mutation.
  return {
    nodes: [
      { id: "validate_input", type: "validate_schema", config: { schema_ref: "input_schema" } },
      { id: "plan", type: "transform", config: { transform: "provisioning_plan", dry_run: true } },
      { id: "approval_gate", type: "approval", config: { risk_class: "PROTECTED", action: "live_provisioning" } },
      { id: "checksum", type: "checksum", config: {} },
      { id: "export", type: "export", config: {} },
    ],
    edges: [
      { from: "validate_input", to: "plan" },
      { from: "plan", to: "approval_gate" },
      { from: "approval_gate", to: "checksum" },
      { from: "checksum", to: "export" },
    ],
  };
}

function codeDag() {
  // Multi-file code generator with sandbox execution (NOT_CONFIGURED until sandbox provisioned).
  return {
    nodes: [
      { id: "validate_input", type: "validate_schema", config: { schema_ref: "input_schema" } },
      { id: "scaffold", type: "template", config: { mode: "file_tree", output: "files" } },
      { id: "validate_output", type: "validate_content", config: { required: ["files"] } },
      { id: "sandbox_test", type: "code_execute", config: { adapter: "sandbox", action: "test_run" } },
      { id: "checksum", type: "checksum", config: {} },
      { id: "package", type: "package", config: {} },
      { id: "export", type: "export", config: {} },
    ],
    edges: [
      { from: "validate_input", to: "scaffold" },
      { from: "scaffold", to: "validate_output" },
      { from: "validate_output", to: "sandbox_test" },
      { from: "sandbox_test", to: "checksum" },
      { from: "checksum", to: "package" },
      { from: "package", to: "export" },
    ],
  };
}

const INPUT_SCHEMA_BASE = {
  type: "object",
  properties: {
    name: { type: "string", minLength: 1 },
    description: { type: "string" },
    context: { type: "object" },
  },
  required: ["name"],
};

const CONSULTING_INPUT = {
  type: "object",
  properties: {
    client_name: { type: "string", minLength: 1 },
    discovery_data: { type: "object" },
    evidence: { type: "object", description: "Explicit evidence; unknowns remain unknown" },
  },
  required: ["client_name"],
};

const PROVISIONING_INPUT = {
  type: "object",
  properties: {
    project_id: { type: "string" },
    current_state: { type: "object" },
    desired_state: { type: "object" },
  },
  required: ["desired_state"],
};

export function buildGeneratorDefinitions() {
  return generatorTypes.map((g) => {
    const isCode = g.category === "code";
    const dag = isCode ? codeDag() : standardDag({ templateMode: g.category === "design" ? "ui_recipe" : "document" });
    return {
      generator_key: g.id,
      name: g.id.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      category: g.category,
      generator_type: g.type,
      version: g.version || SEMVER,
      description: `Canonical ${g.id} generator (${g.status || "canonical-seed"})`,
      definition: {
        id: g.id,
        name: g.id,
        version: g.version || SEMVER,
        input_schema: INPUT_SCHEMA_BASE,
        output_contract: { type: "object", required: isCode ? ["files"] : ["body"] },
        capabilities: isCode ? ["code_generation", "sandbox_execution"] : ["text_generation"],
        workflow_dag: dag,
        templates: [],
        adapters: isCode ? [{ adapter: "sandbox", action: "test_run" }] : [],
        model_policy: { provider: "ai-gateway", required: false, fallback: "NOT_CONFIGURED" },
        validation_policy: { mandatory: ["schema", "completeness", "secret_scan", "artifact_integrity"] },
        repair_policy: { max_rounds: 3, target_only: true },
        security_policy: { sandbox_execution: isCode, secret_scan: true },
        approval_policy: { required: false },
        limits: { max_steps: 50, timeout_seconds: 120, concurrency: 4 },
        observability: { step_logs: true, receipts: true },
        export_policy: { formats: ["json", "zip"], immutable: true },
      },
      status: "approved",
      capabilities: isCode ? ["code_generation", "sandbox_execution"] : ["text_generation"],
    };
  });
}

export function buildConsultingDefinitions() {
  return aiConsultingTemplates.map((t) => ({
    generator_key: `consulting.${t.id}`,
    name: t.id.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    category: "consulting",
    generator_type: t.id,
    version: t.version || SEMVER,
    description: `AI consulting generator: ${t.id} (evidence-required, unknowns stay unknown)`,
    definition: {
      id: `consulting.${t.id}`,
      name: t.id,
      version: t.version || SEMVER,
      input_schema: CONSULTING_INPUT,
      output_contract: { type: "object", required: ["summary", "findings", "unknowns"] },
      capabilities: ["consulting_assessment", "evidence_based"],
      workflow_dag: consultingDag(),
      templates: [],
      adapters: [],
      model_policy: { provider: "ai-gateway", required: false, fallback: "NOT_CONFIGURED", unknowns_blank: true },
      validation_policy: { mandatory: ["schema", "completeness", "secret_scan", "artifact_integrity"] },
      repair_policy: { max_rounds: 3, target_only: true },
      security_policy: { secret_scan: true, no_fabricated_evidence: true },
      approval_policy: { required: false },
      limits: { max_steps: 30, timeout_seconds: 90 },
      observability: { step_logs: true, receipts: true },
      export_policy: { formats: ["json", "md"], immutable: true },
    },
    status: "approved",
    capabilities: ["consulting_assessment", "evidence_based"],
  }));
}

export function buildProvisioningDefinitions() {
  return provisioningTemplates.map((t) => ({
    generator_key: `provisioning.${t.id}`,
    name: t.id.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    category: "infra",
    generator_type: t.id,
    version: t.version || SEMVER,
    description: `Provisioning generator: ${t.id} (plan-first, approval-gated, no live mutation)`,
    definition: {
      id: `provisioning.${t.id}`,
      name: t.id,
      version: t.version || SEMVER,
      input_schema: PROVISIONING_INPUT,
      output_contract: { type: "object", required: ["plan", "diff", "actions", "rollback"] },
      capabilities: ["provisioning_plan", "approval_gated"],
      workflow_dag: provisioningDag(),
      templates: [],
      adapters: [],
      model_policy: { required: false },
      validation_policy: { mandatory: ["schema", "completeness", "artifact_integrity"] },
      repair_policy: { max_rounds: 2, target_only: true },
      security_policy: { dry_run: true, no_live_mutation: true },
      approval_policy: { required: true, risk_class: "PROTECTED" },
      limits: { max_steps: 20, timeout_seconds: 60 },
      observability: { step_logs: true, receipts: true },
      export_policy: { formats: ["json"], immutable: true },
    },
    status: "approved",
    capabilities: ["provisioning_plan", "approval_gated"],
  }));
}

export function buildAllDefinitions() {
  return [
    ...buildGeneratorDefinitions(),
    ...buildConsultingDefinitions(),
    ...buildProvisioningDefinitions(),
  ];
}