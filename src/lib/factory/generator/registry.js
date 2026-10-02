// Registry loader for the Universal Generator Factory (v1).
// Loads the 60 generator types, 30 provisioning templates, and 34 AI consulting
// templates as static versioned data — never hard-coded in markup.
import generatorTypesRaw from "./registry/generator_types.json";
import provisioningTemplatesRaw from "./registry/provisioning_templates.json";
import aiConsultingTemplatesRaw from "./registry/ai_consulting_templates.json";

import generatorDefinitionSchema from "./schemas/generator-definition.schema.json";
import generatorRunSchema from "./schemas/generator-run.schema.json";
import adapterManifestSchema from "./schemas/adapter-manifest.schema.json";
import outputManifestSchema from "./schemas/output-manifest.schema.json";
import provisioningPlanSchema from "./schemas/provisioning-plan.schema.json";
import templatePackSchema from "./schemas/template-pack.schema.json";
import validationReceiptSchema from "./schemas/validation-receipt.schema.json";

export const REGISTRY_VERSION = "ugf-1.0.0";

export const generatorTypes = generatorTypesRaw.generator_types || [];
export const provisioningTemplates = provisioningTemplatesRaw.templates || [];
export const aiConsultingTemplates = aiConsultingTemplatesRaw.templates || [];

export const counts = {
  generator_types: generatorTypesRaw.count || generatorTypes.length,
  provisioning_templates: provisioningTemplatesRaw.count || provisioningTemplates.length,
  ai_consulting_templates: aiConsultingTemplatesRaw.count || aiConsultingTemplates.length,
};

export const schemas = {
  generatorDefinition: generatorDefinitionSchema,
  generatorRun: generatorRunSchema,
  adapterManifest: adapterManifestSchema,
  outputManifest: outputManifestSchema,
  provisioningPlan: provisioningPlanSchema,
  templatePack: templatePackSchema,
  validationReceipt: validationReceiptSchema,
};

export const NODE_TYPES = [
  "transform", "template", "ai_generate", "ai_evaluate", "code_execute", "test",
  "validate_schema", "validate_content", "validate_security", "validate_visual",
  "adapter_read", "adapter_write", "approval", "branch", "fanout", "reduce",
  "package", "checksum", "export",
];

export const RUN_STATUSES = [
  "DRAFT", "VALIDATING_INPUT", "PLANNING", "WAITING_APPROVAL", "QUEUED",
  "RUNNING", "VALIDATING", "REPAIRING", "PASSED", "FAILED", "BLOCKED",
  "CANCELLED", "EXPORTED",
];

export const RISK_CLASSES = ["READ", "DRAFT", "BRANCH_WRITE", "PROTECTED"];

export function findGeneratorType(id) {
  return generatorTypes.find((g) => g.id === id);
}

export function generatorTypesByCategory(category) {
  return generatorTypes.filter((g) => g.category === category);
}

export function findProvisioningTemplate(id) {
  return provisioningTemplates.find((t) => t.id === id);
}

export function findConsultingTemplate(id) {
  return aiConsultingTemplates.find((t) => t.id === id);
}

export const categories = [...new Set(generatorTypes.map((g) => g.category))];