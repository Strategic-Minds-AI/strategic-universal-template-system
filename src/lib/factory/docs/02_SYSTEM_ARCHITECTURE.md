# UNIVERSAL FRONTEND FACTORY — SYSTEM ARCHITECTURE

## Product purpose
A reusable visual-development operating system that lets an operator configure a mobile app, PWA, desktop application, dashboard, ecommerce experience, portal, directory, or marketing site from compatible pattern families and export a deterministic build packet for Base44 or another implementation agent.

## Core engines
1. **Pattern Registry** — versioned mobile, desktop, color, logo, component, navigation, form, grid, typography, image, motion, state, conversion, visualization, AI, responsive, and accessibility patterns.
2. **Compatibility Engine** — blocks incompatible combinations and scores eligible ones.
3. **Brand Engine** — tokenized palettes, typography, logo-construction pattern, iconography, imagery, radius, elevation, and voice. Brand Mode returns exactly 3 brand packs, 3 website/content directions, and 3 workflow options and then stops for operator selection.
4. **Layout Composer** — assembles app shell, page grid, section order, navigation, and breakpoint transformations.
5. **Component Composer** — adds compatible components and all required states.
6. **Screen/Section Composer** — constructs a page map and exact screen/section specifications.
7. **Reference Lock Engine** — converts approved mockups/screenshots into immutable visual constraints and a variance ledger.
8. **Preview Matrix** — renders phone, tablet, desktop, wide desktop, light/dark where applicable.
9. **Validation Engine** — accessibility, responsive, state coverage, content safety, consistency, performance budget, and visual parity checks.
10. **Export Engine** — emits BuildSpec JSON, design-token JSON, component manifest, screen specs, Base44 master prompt, QA checklist, and approval gate.

## Builder UI
Desktop-first tool with five zones:
- **Top command bar:** project, mode, platform, seed, registry version, save snapshot, validate, export.
- **Left rail:** Project / Screens / Sections / Components / Brand / Colors / Logos / Type / Media / Motion / States / Data / Export.
- **Library panel:** searchable/filterable pattern cards with compatibility score and rationale.
- **Center canvas:** live device/frame preview with breakpoint switcher.
- **Right inspector:** selected pattern, tokens, properties, states, responsive rules, locked values.
- **Bottom receipt drawer:** validation results, deltas, warnings, version history, export receipts.

## Recommended routes
- /builder
- /projects
- /projects/:id
- /library/mobile
- /library/desktop
- /library/colors
- /library/logos
- /library/components
- /library/motion
- /preview/:projectId
- /validation/:projectId
- /exports/:projectId
- /settings/registry

## Base44 entities / collections
- PatternFamily
- Pattern
- Palette
- LogoPattern
- ComponentPattern
- DesignTokenPreset
- Project
- ProjectSelection
- ScreenSpec
- AssetReference
- GeneratedBuildSpec
- ValidationReceipt
- VersionSnapshot
- VarianceRequest

## Primary operator flow
Create project -> choose mode -> answer project constraints -> generate compatible options -> choose/freeze direction -> compose screens -> inspect responsive states -> validate -> repair failed checks -> export Base44 build packet.

## Non-negotiable behavior
- Never silently mutate frozen selections.
- Never fabricate customer/business data for previews.
- Never mark a validation PASS without evidence.
- Never let an implementer self-certify visual parity.
- Never perform production release actions from this builder without an explicit approval gate.


## v2 quality-control layer
11. **Semantic Token Compiler** — generates primitive/source, semantic, and component aliases with DTCG-compatible exports.
12. **Experience Recipe Engine** — selects complete task/flow recipes before styling.
13. **Domain Pack Engine** — constrains recipes, density, proof, conversion, and interaction patterns by product class.
14. **Platform Adapter** — translates the same product logic into appropriate web/PWA/iOS-like/Android-like/tablet/desktop conventions.
15. **Consistency Linter** — rejects uncontrolled visual values and common generic-AI UI drift.
16. **Quality Compiler** — runs multi-pass generation with frozen outputs between stages.
17. **Visual Regression Engine** — compares structural, token, perceptual, and behavioral parity against a frozen baseline.
18. **Recommendation Memory** — records operator selections and validation outcomes as weights without silently rewriting canonical patterns.
