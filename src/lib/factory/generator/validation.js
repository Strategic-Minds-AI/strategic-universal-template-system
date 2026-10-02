// Validation mesh — independent validators. No implementer self-certifies.
// Each validator returns { validator_id, layer, status: PASS|FAIL|BLOCKED, evidence, failures }.
import { sha256 } from "./artifacts.js";

// Schema validator: validate a value against a JSON-Schema-like object (subset).
export function validateSchema(value, schema) {
  const failures = [];
  const evidence = [];
  if (!schema || typeof schema !== "object") {
    return { status: "PASS", evidence: ["no schema to validate against"], failures: [] };
  }
  if (schema.type) {
    const t = Array.isArray(value) ? "array" : value === null ? "null" : typeof value;
    const ok = schema.type === t || (schema.type === "object" && t === "object");
    if (!ok) failures.push({ path: "$", expected: schema.type, got: t });
  }
  if (schema.required && Array.isArray(schema.required) && typeof value === "object" && value) {
    for (const k of schema.required) {
      if (!(k in value) || value[k] === undefined || value[k] === null) {
        failures.push({ path: "$." + k, expected: "present", got: "missing" });
      }
    }
  }
  if (schema.properties && typeof value === "object" && value) {
    for (const [k, propSchema] of Object.entries(schema.properties)) {
      if (k in value && value[k] !== undefined && value[k] !== null) {
        const sub = validateSchema(value[k], propSchema);
        if (sub.failures.length) {
          for (const f of sub.failures) failures.push({ ...f, path: "$." + k + (f.path !== "$" ? f.path.slice(1) : "") });
        }
      }
    }
  }
  if (schema.enum && Array.isArray(schema.enum)) {
    if (!schema.enum.includes(value)) failures.push({ path: "$", expected: `one of ${schema.enum.join("|")}`, got: String(value) });
  }
  if (schema.minLength !== undefined && typeof value === "string" && value.length < schema.minLength) {
    failures.push({ path: "$", expected: `minLength ${schema.minLength}`, got: `${value.length}` });
  }
  if (schema.pattern !== undefined && typeof value === "string") {
    if (!new RegExp(schema.pattern).test(value)) failures.push({ path: "$", expected: `pattern ${schema.pattern}`, got: value });
  }
  evidence.push(`checked type=${schema.type || "any"} required=${(schema.required || []).length}`);
  return { status: failures.length === 0 ? "PASS" : "FAIL", evidence, failures };
}

// Completeness validator: ensure required fields/sections are present and non-empty.
export function validateCompleteness(value, requiredFields) {
  const failures = [];
  for (const f of requiredFields) {
    const v = value && typeof value === "object" ? value[f] : undefined;
    if (v === undefined || v === null || v === "" || (Array.isArray(v) && v.length === 0)) {
      failures.push({ field: f, reason: "missing or empty" });
    }
  }
  return {
    status: failures.length === 0 ? "PASS" : "FAIL",
    evidence: [`required fields checked: ${requiredFields.join(", ")}`],
    failures,
  };
}

// Secret-scan validator: reject plaintext secrets in content.
const SECRET_PATTERNS = [
  /(?:sk-|pk-|rk_)[a-zA-Z0-9]{20,}/, // stripe-like
  /-----BEGIN [A-Z]+ PRIVATE KEY-----/,
  /(?:password|passwd|secret|api[_-]?key)\s*[:=]\s*["'][^"']{8,}["']/i,
  /eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}/, // JWT
];

export function validateSecretScan(text) {
  const failures = [];
  for (const re of SECRET_PATTERNS) {
    const m = (text || "").match(re);
    if (m) failures.push({ pattern: re.source, sample: m[0].slice(0, 12) + "..." });
  }
  return {
    status: failures.length === 0 ? "PASS" : "FAIL",
    evidence: failures.length === 0 ? ["no secret patterns detected"] : [`detected ${failures.length} secret pattern(s)`],
    failures,
  };
}

// Artifact-integrity validator: verify content checksums.
export async function validateArtifactIntegrity(artifacts) {
  const failures = [];
  for (const a of artifacts) {
    const sha = await sha256(a.content || "");
    if (sha !== a.sha256) failures.push({ artifact: a.name, declared: a.sha256, computed: sha });
  }
  return {
    status: failures.length === 0 ? "PASS" : "FAIL",
    evidence: [`verified ${artifacts.length} artifact checksum(s)`],
    failures,
  };
}

// Run the validation mesh over a run's artifacts + output.
export async function runValidationMesh({ run_id, output, output_contract, artifacts, requiredFields }) {
  const receipts = [];
  // 1. schema
  receipts.push({
    validator_id: "schema-validator-v1",
    validator_layer: "schema",
    subject_hash: await sha256(JSON.stringify(output || {})),
    status: validateSchema(output, output_contract?.schema || output_contract || {}).status,
    evidence: validateSchema(output, output_contract?.schema || output_contract || {}).evidence,
    failures: validateSchema(output, output_contract?.schema || output_contract || {}).failures,
    mandatory: true,
  });
  // 2. completeness
  const comp = validateCompleteness(output, requiredFields || output_contract?.required || []);
  receipts.push({
    validator_id: "completeness-validator-v1",
    validator_layer: "completeness",
    subject_hash: await sha256(JSON.stringify(output || {})),
    ...comp,
    mandatory: true,
  });
  // 3. secret scan (across all artifact content)
  const allText = (artifacts || []).map((a) => a.content || "").join("\n");
  const ss = validateSecretScan(allText);
  receipts.push({
    validator_id: "secret-scan-v1",
    validator_layer: "secret_scan",
    subject_hash: await sha256(allText),
    ...ss,
    mandatory: true,
  });
  // 4. artifact integrity
  const ai = await validateArtifactIntegrity(artifacts || []);
  receipts.push({
    validator_id: "artifact-integrity-v1",
    validator_layer: "artifact_integrity",
    subject_hash: await sha256((artifacts || []).map((a) => a.sha256).join("|")),
    ...ai,
    mandatory: true,
  });
  return receipts;
}

export function overallValidationStatus(receipts) {
  const mandatoryFails = receipts.filter((r) => r.mandatory && r.status === "FAIL");
  const blocked = receipts.filter((r) => r.status === "BLOCKED");
  if (blocked.length) return "BLOCKED";
  if (mandatoryFails.length) return "FAIL";
  return "PASS";
}