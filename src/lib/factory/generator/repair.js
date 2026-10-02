// Recursive repair engine. On validator failure: classify layer, identify the
// smallest responsible component (step), create a repair task, patch only the
// target, rerun the failed validator, then run regression. Never rebuild
// unrelated working portions.

export function classifyFailure(receipt) {
  // Map a failing validator layer to the step type most likely responsible.
  const map = {
    schema: "template",
    completeness: "template",
    secret_scan: "template",
    artifact_integrity: "checksum",
    lint: "code_execute",
    typecheck: "code_execute",
    compile: "code_execute",
    unit: "test",
    integration: "test",
    e2e: "test",
    visual_regression: "template",
    accessibility: "template",
    security: "validate_security",
    dependency: "code_execute",
    data_integrity: "adapter_write",
    backend_parity: "adapter_write",
    acceptance: "export",
  };
  return map[receipt.validator_layer] || "template";
}

// Create a repair task targeting the smallest responsible step.
export function createRepairTask({ run_id, validation_id, receipt, steps }) {
  const targetStepType = classifyFailure(receipt);
  const candidate = (steps || []).find((s) => s.step_type === targetStepType && s.status !== "passed");
  const target = candidate || (steps || []).find((s) => s.status === "failed") || (steps || [])[0];
  return {
    run_id,
    validation_id,
    target_step_key: target?.step_key || "unknown",
    failing_layer: receipt.validator_layer,
    status: "open",
    repair_spec: {
      layer: receipt.validator_layer,
      failures: receipt.failures,
      patch_target: target?.step_key,
      patch_type: "regenerate_target_step",
      note: "Patch only the target step; do not rebuild unrelated working portions.",
    },
    attempt: 0,
  };
}

// Apply a repair: for deterministic failures, the repair is a config correction
// that the executor re-runs. For NOT_CONFIGURED, the repair is blocked (needs
// operator configuration, not a code patch).
export function classifyRepair(repairTask) {
  const layer = repairTask.failing_layer;
  if (repairTask.repair_spec?.failures?.some((f) => f.reason === "NOT_CONFIGURED")) {
    return { action: "block", reason: "Adapter not configured — operator action required, not a code repair." };
  }
  if (["schema", "completeness", "secret_scan"].includes(layer)) {
    return { action: "regenerate", reason: "Template/schema mismatch — regenerate target step with corrected config." };
  }
  if (["lint", "typecheck", "compile", "unit", "integration", "e2e"].includes(layer)) {
    return { action: "regenerate", reason: "Code/test failure — regenerate target step with corrected template." };
  }
  return { action: "regenerate", reason: "Generic failure — regenerate target step." };
}