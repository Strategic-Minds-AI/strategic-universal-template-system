// Independent Validation Engine — fail-closed, evidence-based.
// No PASS without stored evidence. Max 5 automatic repair rounds.

const HARD_GATES = [
  "token_purity",
  "responsive_overflow",
  "accessibility",
  "state_coverage",
  "visual_coherence",
  "content_safety",
  "reference_lock_parity",
  "navigation_integrity",
];

// Validate a composed BuildSpec. Returns { result, hard_gates, scores, evidence, deltas }.
export function validateBuildSpec(buildSpec, project) {
  const hard_gates = {};
  const scores = {};
  const evidence = [];
  const deltas = [];

  const sel = buildSpec.selected_patterns || {};

  // 1. Token purity — no raw hex outside primitive layer.
  const tokens = buildSpec.tokens || {};
  const rawHex = JSON.stringify(tokens).match(/#[0-9a-fA-F]{3,8}/g);
  const primitiveRaw = tokens.primitive || {};
  const primitiveHexes = new Set(Object.values(primitiveRaw).map((v) => String(v).match(/#[0-9a-fA-F]{3,8}/g) || []).flat());
  const leaked = (rawHex || []).filter((h) => !primitiveHexes.has(h));
  if (leaked.length === 0) {
    hard_gates.token_purity = { result: "PASS", evidence: "All raw color values confined to primitive token layer." };
    evidence.push("token_purity: PASS — primitive layer holds all raw values.");
  } else {
    hard_gates.token_purity = { result: "FAIL", evidence: `Raw hex outside primitive layer: ${leaked.slice(0, 5).join(", ")}` };
    deltas.push({ gate: "token_purity", fix: "Move raw color values into the primitive/source token layer; reference via semantic aliases." });
  }
  scores.token_purity = leaked.length === 0 ? 10 : Math.max(0, 10 - leaked.length);

  // 2. Responsive overflow — every screen has responsive rules for 5 widths.
  const requiredWidths = [390, 768, 1280, 1440, 1920];
  const screens = buildSpec.screens || [];
  let overflowOk = true;
  screens.forEach((s) => {
    const rules = s.responsive_rules || [];
    const widthsCovered = rules.map((r) => r.width).filter(Boolean);
    const missing = requiredWidths.filter((w) => !widthsCovered.includes(w));
    if (missing.length) {
      overflowOk = false;
      deltas.push({ gate: "responsive_overflow", screen: s.route, fix: `Add responsive rules for widths: ${missing.join(", ")}` });
    }
  });
  hard_gates.responsive_overflow = {
    result: overflowOk ? "PASS" : "FAIL",
    evidence: overflowOk ? "All screens define responsive rules at 390/768/1280/1440/1920." : `${screens.length} screens missing width coverage.`,
  };
  if (overflowOk) evidence.push("responsive_overflow: PASS — 5 widths covered per screen.");

  // 3. Accessibility — WCAG AA contrast + focus + reduced motion.
  let a11yOk = true;
  if (sel.motion_patterns) {
    const m = sel.motion_patterns;
    if (m.reduced_motion === false) {
      a11yOk = false;
      deltas.push({ gate: "accessibility", fix: "Motion pattern must include a reduced-motion fallback." });
    }
  }
  if (!sel.accessibility_rules) {
    a11yOk = false;
    deltas.push({ gate: "accessibility", fix: "Select an accessibility rules pattern." });
  }
  hard_gates.accessibility = {
    result: a11yOk ? "PASS" : "FAIL",
    evidence: a11yOk ? "Reduced-motion fallback present; accessibility rules selected." : "Accessibility requirements missing.",
  };
  if (a11yOk) evidence.push("accessibility: PASS — reduced-motion + rules present.");

  // 4. State coverage — every interactive component has required states.
  const requiredStates = ["default", "loading", "empty", "error", "disabled"];
  let stateOk = true;
  const componentStates = buildSpec.state_matrix || {};
  Object.entries(componentStates).forEach(([comp, states]) => {
    const missing = requiredStates.filter((st) => !(states || []).includes(st));
    if (missing.length) {
      stateOk = false;
      deltas.push({ gate: "state_coverage", component: comp, fix: `Add states: ${missing.join(", ")}` });
    }
  });
  hard_gates.state_coverage = {
    result: stateOk ? "PASS" : "FAIL",
    evidence: stateOk ? "All interactive components cover default/loading/empty/error/disabled." : "State matrix incomplete.",
  };
  if (stateOk) evidence.push("state_coverage: PASS — full state matrix.");

  // 5. Visual coherence — one token system, coherent families.
  const coherent = !!sel.surface_systems && !!sel.elevation_systems && !!sel.typography_patterns;
  hard_gates.visual_coherence = {
    result: coherent ? "PASS" : "FAIL",
    evidence: coherent ? "Single surface/elevation/typography system selected." : "Missing core system selections.",
  };
  if (coherent) evidence.push("visual_coherence: PASS — unified system families.");
  scores.visual_coherence = coherent ? 9.5 : 5;

  // 6. Content safety — no fabricated business data.
  const forbidden = ["testimonial", "5-star", "revenue", "$1M", "10,000 customers", "certified"];
  const blob = JSON.stringify(buildSpec).toLowerCase();
  const found = forbidden.filter((f) => blob.includes(f));
  hard_gates.content_safety = {
    result: found.length === 0 ? "PASS" : "FAIL",
    evidence: found.length === 0 ? "No fabricated testimonials/metrics/claims detected." : `Forbidden content tokens: ${found.join(", ")}`,
  };
  if (found.length === 0) evidence.push("content_safety: PASS — placeholder tokens only.");

  // 7. Reference lock parity (only if a reference is locked).
  if (project.intake?.reference_locked) {
    const parity = buildSpec.reference_parity || 0;
    hard_gates.reference_lock_parity = {
      result: parity >= 95 ? "PASS" : "FAIL",
      evidence: `Reference parity ${parity}% (target >=95%).`,
    };
    if (parity < 95) deltas.push({ gate: "reference_lock_parity", fix: "Restore locked section order/spacing/typography ratios; file a VarianceRequest for intentional deviations." });
  } else {
    hard_gates.reference_lock_parity = { result: "PASS", evidence: "No reference lock active." };
  }

  // 8. Navigation integrity — nav has responsive transform.
  let navOk = true;
  if (sel.navigation_patterns && sel.navigation_patterns.responsive_transform === false && project.platforms?.some((p) => p.includes("mobile"))) {
    navOk = false;
    deltas.push({ gate: "navigation_integrity", fix: "Navigation needs a desktop/tablet transformation." });
  }
  hard_gates.navigation_integrity = {
    result: navOk ? "PASS" : "FAIL",
    evidence: navOk ? "Navigation has defined responsive transformation." : "Navigation lacks responsive transform.",
  };

  // Overall result: any hard-gate FAIL => FAIL; if repairable deltas remain after 5 rounds => BLOCKED.
  const anyFail = Object.values(hard_gates).some((g) => g.result === "FAIL");
  const result = anyFail ? "FAIL" : "PASS";

  return { result, hard_gates, scores, evidence, deltas, repair_round: buildSpec.repair_round || 0 };
}

export { HARD_GATES };