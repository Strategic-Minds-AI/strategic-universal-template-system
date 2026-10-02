// Pattern Compatibility Engine + Deterministic Selector
// Implements the hard constraints and 100-point compatibility model from
// 03_PATTERN_COMPATIBILITY_ENGINE.md. Hard-constraint failure = ineligible.
// Eligibility threshold = 75. Deterministic tie-break: stable sort by score
// desc, then pattern id, then seeded index.

import { REGISTRY, REGISTRY_VERSION } from "./registry/index.js";

const ELIGIBILITY_THRESHOLD = 75;

// Hard constraints (per spec). Returns array of failure reasons (empty = ok).
export function checkHardConstraints(selection, project) {
  const failures = [];

  // 1. Mobile navigation must have a desktop/tablet transformation.
  if (selection.navigation && selection.mobile_patterns) {
    const nav = getPattern("navigation_patterns", selection.navigation);
    const hasTransform = nav && (nav.responsive_transform || nav.desktop_transform || nav.tablet_transform);
    if (nav && !hasTransform && project.platforms?.some((p) => p.includes("mobile"))) {
      failures.push("Selected mobile navigation has no defined desktop/tablet transformation.");
    }
  }

  // 2. Full-screen swipe feed cannot be primary layout for dense admin/data.
  if (selection.mobile_patterns && project.product_archetype) {
    const mp = getPattern("mobile_patterns", selection.mobile_patterns);
    if (mp && /swipe|fullscreen feed|immersive/i.test(mp.name || "") &&
        /admin|dashboard|data|analytics|crm/i.test(project.product_archetype)) {
      failures.push("Full-screen swipe feed cannot be the primary layout for dense admin/data products.");
    }
  }

  // 3. Dense table/command-center cannot be phone default.
  if (selection.desktop_patterns && project.platforms?.includes("mobile-web")) {
    const dp = getPattern("desktop_patterns", selection.desktop_patterns);
    if (dp && /command.center|dense table/i.test(dp.name || "") && !selection.mobile_patterns) {
      failures.push("Dense table/command-center layout cannot be used as the phone default.");
    }
  }

  // 4. Hover-only interactions forbidden.
  if (selection.component_patterns) {
    const comps = selection.component_patterns;
    const arr = Array.isArray(comps) ? comps : [comps];
    arr.forEach((id) => {
      const c = getPattern("component_patterns", id);
      if (c && c.hover_only) failures.push(`Component ${id} is hover-only — forbidden.`);
    });
  }

  // 5. Motion patterns must include reduced-motion behavior.
  if (selection.motion_patterns) {
    const m = getPattern("motion_patterns", selection.motion_patterns);
    if (m && m.reduced_motion === false) {
      failures.push("Selected motion pattern lacks a reduced-motion fallback.");
    }
  }

  // 7. Selected palette must pass contrast checks (delegated to color engine).
  // 8. Logo pattern must have icon-only and one-color variants.
  if (selection.logo_patterns) {
    const l = getPattern("logo_patterns", selection.logo_patterns);
    if (l && (!l.icon_only_variant || !l.one_color_variant)) {
      failures.push("Selected logo pattern must have icon-only and one-color variants.");
    }
  }

  return failures;
}

function getPattern(family, id) {
  const fam = REGISTRY[family];
  if (!fam) return null;
  return (fam.items || []).find((p) => p.id === id) || null;
}

// Score a single pattern against a project context (0-100).
export function scorePattern(pattern, family, project) {
  let score = 0;

  // platform fit: 25
  if (pattern.platforms && project.platforms) {
    const overlap = pattern.platforms.filter((p) => project.platforms.includes(p)).length;
    score += (overlap / Math.max(1, project.platforms.length)) * 25;
  } else if (!pattern.platforms) {
    score += 12; // neutral
  }

  // primary-goal fit: 20
  if (pattern.goals && project.primary_goal && pattern.goals.includes(project.primary_goal)) {
    score += 20;
  } else if (pattern.goals) {
    score += 6;
  } else {
    score += 10;
  }

  // information-density fit: 15
  if (pattern.density && project.intake?.information_density === pattern.density) {
    score += 15;
  } else if (!pattern.density) {
    score += 7;
  }

  // navigation/layout fit: 10
  if (pattern.navigation_family && project.intake?.navigation_family === pattern.navigation_family) {
    score += 10;
  } else if (!pattern.navigation_family) {
    score += 5;
  }

  // brand-tone fit: 10
  if (pattern.brand_tone && project.intake?.brand_tone === pattern.brand_tone) {
    score += 10;
  } else if (!pattern.brand_tone) {
    score += 5;
  }

  // conversion-path fit: 10
  if (pattern.conversion && project.primary_conversion === pattern.conversion) {
    score += 10;
  } else if (!pattern.conversion) {
    score += 5;
  }

  // accessibility fit: 5
  if (pattern.accessibility && project.intake?.accessibility_needs === "high") {
    score += 5;
  } else {
    score += 2;
  }

  // motion/media fit: 5
  if (pattern.media_intensity && project.intake?.content_media_intensity === pattern.media_intensity) {
    score += 5;
  } else {
    score += 2;
  }

  return Math.round(Math.min(100, Math.max(0, score)));
}

// Deterministic seeded hash for tie-breaking.
function seededIndex(seed, i) {
  let h = 0;
  const s = String(seed || "uff") + ":" + i;
  for (let k = 0; k < s.length; k++) h = (h * 31 + s.charCodeAt(k)) >>> 0;
  return h;
}

// Rank all patterns in a family for a project, deterministic.
export function rankFamily(family, project) {
  const fam = REGISTRY[family];
  if (!fam) return [];
  const items = fam.items || [];
  const scored = items.map((p, i) => ({
    ...p,
    family,
    score: scorePattern(p, family, project),
    _seed: seededIndex(project.seed, i),
  }));
  // stable sort: score desc, then id asc, then seeded index
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (a.id < b.id) return -1;
    if (a.id > b.id) return 1;
    return a._seed - b._seed;
  });
  return scored;
}

// Select the top eligible pattern for a family, respecting frozen selections.
export function selectForFamily(family, project, frozenIds = []) {
  const ranked = rankFamily(family, project);
  // If a frozen selection exists, keep it.
  for (const id of frozenIds) {
    const found = ranked.find((r) => r.id === id);
    if (found) return { ...found, frozen: true };
  }
  // Otherwise pick the top eligible (>= threshold).
  const eligible = ranked.filter((r) => r.score >= ELIGIBILITY_THRESHOLD);
  if (eligible.length) return { ...eligible[0], frozen: false };
  // Fallback: top-ranked regardless of threshold (marked low-score).
  return ranked[0] ? { ...ranked[0], frozen: false, lowScore: true } : null;
}

// Compose a full selection across the builder_config selection order.
export function composeSelection(project, frozen = {}) {
  const order = [
    "domain_packs",
    "experience_recipes",
    "platform_adapters",
    "mobile_patterns",
    "desktop_patterns",
    "navigation_patterns",
    "color_systems",
    "typography_patterns",
    "logo_patterns",
    "component_patterns",
    "motion_patterns",
    "surface_systems",
    "elevation_systems",
    "responsive_transformations",
    "grid_patterns",
    "form_patterns",
    "conversion_patterns",
    "state_patterns",
    "image_patterns",
    "icon_systems",
    "content_hierarchy_patterns",
    "data_visualization_patterns",
    "ai_interaction_patterns",
    "accessibility_rules",
  ];
  const result = {};
  for (const family of order) {
    const frozenIds = frozen[family] ? [frozen[family]] : [];
    const sel = selectForFamily(family, project, frozenIds);
    if (sel) result[family] = sel;
  }
  return result;
}

export { ELIGIBILITY_THRESHOLD, REGISTRY_VERSION };