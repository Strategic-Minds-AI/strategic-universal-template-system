// Universal Frontend Factory — versioned pattern registry aggregator.
// Patterns are imported as static JSON (never hard-coded in markup) so the
// composer stays data-driven and new patterns can be added without code changes.

import builderConfig from "./builder_config.json";

import accessibilityRules from "./patterns/accessibility_rules.json";
import aiInteractionPatterns from "./patterns/ai_interaction_patterns.json";
import colorSystems from "./patterns/color_systems.json";
import componentPatterns from "./patterns/component_patterns.json";
import compositionGrammar from "./patterns/composition_grammar.json";
import contentHierarchyPatterns from "./patterns/content_hierarchy_patterns.json";
import conversionPatterns from "./patterns/conversion_patterns.json";
import dataVisualizationPatterns from "./patterns/data_visualization_patterns.json";
import densityModes from "./patterns/density_modes.json";
import desktopPatterns from "./patterns/desktop_patterns.json";
import deviceProfiles from "./patterns/device_profiles.json";
import domainPacks from "./patterns/domain_packs.json";
import elevationSystems from "./patterns/elevation_systems.json";
import experienceRecipes from "./patterns/experience_recipes.json";
import flowPatterns from "./patterns/flow_patterns.json";
import formPatterns from "./patterns/form_patterns.json";
import gridPatterns from "./patterns/grid_patterns.json";
import iconSystems from "./patterns/icon_systems.json";
import imagePatterns from "./patterns/image_patterns.json";
import logoPatterns from "./patterns/logo_patterns.json";
import mobilePatterns from "./patterns/mobile_patterns.json";
import motionPatterns from "./patterns/motion_patterns.json";
import navigationPatterns from "./patterns/navigation_patterns.json";
import platformAdapters from "./patterns/platform_adapters.json";
import qualityProfiles from "./patterns/quality_profiles.json";
import qualityRules from "./patterns/quality_rules.json";
import responsiveTransformations from "./patterns/responsive_transformations.json";
import semanticColorRoles from "./patterns/semantic_color_roles.json";
import statePatterns from "./patterns/state_patterns.json";
import surfaceSystems from "./patterns/surface_systems.json";
import themeModes from "./patterns/theme_modes.json";
import typographyPatterns from "./patterns/typography_patterns.json";
import typographyStrategies from "./patterns/typography_strategies.json";

import buildSpecSchema from "./schemas/build_spec.schema.json";
import patternSchema from "./schemas/pattern.schema.json";
import qualityReceiptSchema from "./schemas/quality_receipt.schema.json";

import exampleDesktopSaas from "./examples/example_desktop_saas.json";
import exampleMobileLocalDiscovery from "./examples/example_mobile_local_discovery.json";

// Map of family key -> { label, items }
export const REGISTRY = {
  accessibility_rules: { label: "Accessibility Rules", items: accessibilityRules },
  ai_interaction_patterns: { label: "AI Interaction Patterns", items: aiInteractionPatterns },
  color_systems: { label: "Color Systems", items: colorSystems },
  component_patterns: { label: "Component Patterns", items: componentPatterns },
  composition_grammar: { label: "Composition Grammar", items: compositionGrammar },
  content_hierarchy_patterns: { label: "Content Hierarchy", items: contentHierarchyPatterns },
  conversion_patterns: { label: "Conversion Patterns", items: conversionPatterns },
  data_visualization_patterns: { label: "Data Visualization", items: dataVisualizationPatterns },
  density_modes: { label: "Density Modes", items: densityModes },
  desktop_patterns: { label: "Desktop Archetypes", items: desktopPatterns },
  device_profiles: { label: "Device Profiles", items: deviceProfiles },
  domain_packs: { label: "Domain Packs", items: domainPacks },
  elevation_systems: { label: "Elevation Systems", items: elevationSystems },
  experience_recipes: { label: "Experience Recipes", items: experienceRecipes },
  flow_patterns: { label: "Flow Patterns", items: flowPatterns },
  form_patterns: { label: "Form Patterns", items: formPatterns },
  grid_patterns: { label: "Grid Patterns", items: gridPatterns },
  icon_systems: { label: "Icon Systems", items: iconSystems },
  image_patterns: { label: "Image Patterns", items: imagePatterns },
  logo_patterns: { label: "Logo Patterns", items: logoPatterns },
  mobile_patterns: { label: "Mobile Archetypes", items: mobilePatterns },
  motion_patterns: { label: "Motion Patterns", items: motionPatterns },
  navigation_patterns: { label: "Navigation Patterns", items: navigationPatterns },
  platform_adapters: { label: "Platform Adapters", items: platformAdapters },
  quality_profiles: { label: "Quality Profiles", items: qualityProfiles },
  quality_rules: { label: "Quality Rules", items: qualityRules },
  responsive_transformations: { label: "Responsive Transforms", items: responsiveTransformations },
  semantic_color_roles: { label: "Semantic Color Roles", items: semanticColorRoles },
  state_patterns: { label: "State Patterns", items: statePatterns },
  surface_systems: { label: "Surface Systems", items: surfaceSystems },
  theme_modes: { label: "Theme Modes", items: themeModes },
  typography_patterns: { label: "Typography Patterns", items: typographyPatterns },
  typography_strategies: { label: "Typography Strategies", items: typographyStrategies },
};

export const SCHEMAS = { buildSpecSchema, patternSchema, qualityReceiptSchema };
export const EXAMPLES = { exampleDesktopSaas, exampleMobileLocalDiscovery };
export const BUILDER_CONFIG = builderConfig;

export const REGISTRY_VERSION = builderConfig.version || "2.0.0";

// Total entry count for audit display
export const TOTAL_ENTRIES = Object.values(REGISTRY).reduce(
  (sum, fam) => sum + (Array.isArray(fam.items) ? fam.items.length : 0),
  0
);

// Flat list of all patterns with their family attached
export const ALL_PATTERNS = Object.entries(REGISTRY).flatMap(([family, fam]) =>
  (fam.items || []).map((p) => ({ ...p, family, familyLabel: fam.label }))
);

// Helper: get a single pattern by family + id
export function getPattern(family, id) {
  const fam = REGISTRY[family];
  if (!fam) return null;
  return (fam.items || []).find((p) => p.id === id) || null;
}

// Helper: list a family
export function listFamily(family) {
  const fam = REGISTRY[family];
  return fam ? fam.items || [] : [];
}