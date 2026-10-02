// Seed template packs — builds real TemplatePack records for all generator
// types, AI consulting templates, and provisioning templates. Each pack has
// a manifest with files + variables_schema. Mirrors the generator seed pattern.
import { generatorTypes, aiConsultingTemplates, provisioningTemplates } from "./registry.js";

const SEMVER = "1.0.0";

function titleCase(id) {
  return id.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function modeForCategory(category) {
  if (category === "code") return "code";
  if (category === "design") return "ui_recipe";
  if (category === "infra") return "provisioning_recipe";
  return "document";
}

export function buildAllTemplatePacks() {
  const packs = [];

  generatorTypes.forEach((g) => {
    const mode = modeForCategory(g.category);
    packs.push({
      template_key: `gen.${g.id}`,
      name: titleCase(g.id),
      version: g.version || SEMVER,
      mode,
      manifest: {
        files: mode === "code" ? [{ path: "src/index.ts", role: "entry" }] : [{ path: "output.md", role: "rendered" }],
        variables_schema: { type: "object", properties: { name: { type: "string" }, context: { type: "object" } }, required: ["name"] },
        generator: g.id,
        category: g.category,
      },
      status: "published",
      dependencies: [],
    });
  });

  aiConsultingTemplates.forEach((t) => {
    packs.push({
      template_key: `consulting.${t.id}`,
      name: titleCase(t.id),
      version: t.version || SEMVER,
      mode: "document",
      manifest: {
        files: [{ path: "assessment.md", role: "rendered" }],
        variables_schema: { type: "object", properties: { client_name: { type: "string" }, evidence: { type: "object" } }, required: ["client_name"] },
        requires_evidence: !!t.requires_evidence,
        category: "consulting",
      },
      status: "published",
      dependencies: [],
    });
  });

  provisioningTemplates.forEach((t) => {
    packs.push({
      template_key: `provisioning.${t.id}`,
      name: titleCase(t.id),
      version: t.version || SEMVER,
      mode: "provisioning_recipe",
      manifest: {
        files: [{ path: "plan.json", role: "rendered" }],
        variables_schema: { type: "object", properties: { project_id: { type: "string" }, desired_state: { type: "object" } }, required: ["desired_state"] },
        live_execution_requires_approval: !!t.live_execution_requires_approval,
        category: "provisioning",
      },
      status: "published",
      dependencies: [],
    });
  });

  return packs;
}