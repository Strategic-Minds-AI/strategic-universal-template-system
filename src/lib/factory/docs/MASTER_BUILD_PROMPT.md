# BASE44 MASTER BUILD PROMPT — UNIVERSAL FRONTEND FACTORY

## Objective
Create an internal program named **Universal Frontend Factory**. It is a deterministic frontend design/build-spec generator, not a collection of static templates. The application must hold a versioned pattern library and let an operator compose production-grade mobile apps, PWAs, desktop web applications, dashboards, ecommerce experiences, portals, directories, and marketing websites from compatible pattern families.

## Source of truth
Use every file in this package. `builder_config.json` defines global behavior. `/patterns` contains the canonical pattern registry. `/schemas` defines generated BuildSpec structure. `02_SYSTEM_ARCHITECTURE.md`, `03_PATTERN_COMPATIBILITY_ENGINE.md`, `04_BUILDER_UI_SPEC.md`, `05_VALIDATION_RUBRIC.md`, and `base44/AI_CONTROLS.txt` are mandatory implementation constraints.

## Build sequence
### Phase 1 — Registry and data model
Create Base44 entities/collections for PatternFamily, Pattern, Palette, LogoPattern, ComponentPattern, DesignTokenPreset, Project, ProjectSelection, ScreenSpec, AssetReference, GeneratedBuildSpec, ValidationReceipt, VersionSnapshot, and VarianceRequest. Import the supplied registries. Keep pattern IDs stable.

### Phase 2 — Compatibility engine
Implement the hard constraints and 100-point compatibility model exactly as documented. A hard-constraint failure makes a combination ineligible. Eligibility threshold = 75. Selection must be deterministic using stable score sorting, pattern ID tie-break, and project seed for exact-score ties.

### Phase 3 — Builder shell
Implement the desktop-first builder UI: top command bar, left navigation rail, searchable library panel, responsive preview canvas, right inspector, validation/receipt drawer. Support 390, 768, 1280, 1440, and 1920 previews plus custom sizes.

### Phase 4 — Project creation modes
Implement:
1. QuickStart
2. Guided
3. Brand Mode
4. Reference Lock
5. Vertical Clone
6. Component Lab

In **Brand Mode**, produce exactly three Brand Packs, three Website/Content Designs, and three Workflow Options and then STOP until the operator chooses. Do not automatically continue to implementation.

### Phase 5 — Composer
Allow selection of platform, archetype, primary goal, density, interaction mode, conversion mode, brand tone, navigation, layout, palette, type pattern, logo pattern, image pattern, components, motion, and responsive transformations. Show only compatible choices by default; include a diagnostic view explaining why a pattern is blocked.

### Phase 6 — Tokens and components
Generate design tokens for color, type, spacing, radius, elevation, border, icon size, breakpoints, motion, z-index, and content widths. All UI components must consume tokens. No repeated visual constants should be hard-coded across unrelated components.

### Phase 7 — Screen generation
Generate a screen/page map, section order, component inventory, responsive rules, state requirements, content placeholders, backend dependency declarations, analytics event declarations, and acceptance criteria. Preview content must use explicit placeholder tokens such as `[BRAND_NAME]`, `[PRIMARY_CTA]`, `[PRODUCT_IMAGE_1]` rather than fake business/customer data.

### Phase 8 — Reference Lock
Allow an operator to attach an approved screenshot/mockup/reference. Store the reference and a locked contract for layout, component order, spacing, typography roles, color ratios, radii, shadows, imagery treatment, nav, CTA, motion, and breakpoint behavior. No locked rule may change without a VarianceRequest.

### Phase 9 — Validation
Create fail-closed validators for visual coherence, responsive behavior, state coverage, accessibility, content safety, motion, performance intent, and reference parity. Return PASS / FAIL / BLOCKED with evidence. No evidence = no PASS.

### Phase 10 — Export
Export an implementation packet containing:
- BuildSpec JSON
- design tokens JSON
- selected pattern IDs and registry version
- page/screen map
- component manifest
- responsive rules
- motion rules
- state matrix
- accessibility requirements
- placeholder content map
- backend dependency map
- analytics event map
- validation receipt
- Base44 implementation prompt
- approval gate

## Required library scope
The initial registry in this package contains 20 mobile layout archetypes, 20 desktop layout archetypes, 20 color systems, 50 logo-construction patterns, plus component, navigation, form, motion, typography, image, grid, state, conversion, data-visualization, AI-interaction, responsive-transformation, and accessibility pattern libraries. The architecture must permit future patterns to be added without code changes to the composer.

## Frontend quality rules
- Mobile is purpose-built, not a squeezed desktop.
- Desktop is purpose-built, not an enlarged phone.
- Responsive transformations are explicit.
- Use clear hierarchy and whitespace before decoration.
- Keep primary actions obvious.
- Preserve usability at zoom and large text.
- Every interactive control has focus/keyboard behavior.
- All drawers/modals/sheets have correct focus behavior.
- Use motion only for hierarchy, causality, continuity, or feedback and provide reduced-motion fallback.
- Use original/licensed assets; never copy protected brand assets.

## Build constraints
Use reusable components and data-driven registries. Keep the pattern registry separate from project instances. Preserve version history and undo/redo. Add freeze/lock controls. Do not hard-code the 20/20/20/50 libraries directly into page markup; import them into the registry. Do not introduce production secrets, payments, DNS, live messaging, or destructive actions.

## Acceptance tests
1. Same registry version + same BuildSpec + same seed returns the same selected pattern set.
2. An ineligible combination is blocked with an explanation.
3. Brand Mode returns exactly 3/3/3 and stops.
4. All 20 mobile, 20 desktop, 20 color, and 50 logo patterns are browsable and searchable.
5. A project can freeze any selection and regenerate unfrozen portions without changing frozen IDs.
6. Reference Lock prevents unapproved visual drift.
7. Preview works at 390/768/1280/1440/1920 widths with no unintended horizontal scroll.
8. Export contains all required files/sections and selected IDs.
9. Content-safety validation rejects fake reviews, customer names, claims, or addresses.
10. Validation cannot report PASS without stored evidence.

## Approval gate
Build and validate the Universal Frontend Factory in a draft/sandbox environment. Do not publish to production or change existing production applications until the operator explicitly approves release.


# V2 QUALITY COMPILER — MANDATORY

Do not treat the registry as a menu of independent visual choices. Build in this order:

Domain Pack -> Experience Recipe -> Platform Adapter -> Information Architecture -> Flow Graph -> Grayscale Layout -> Semantic Token Synthesis -> Component Composition -> Responsive/State Completion -> Visual Polish -> Independent Validation -> Targeted Repair -> Freeze/Export.

## Semantic token rule
All production-facing component styling must resolve through semantic/component tokens. Raw visual values may exist only in the primitive/source layer. Export token JSON in a DTCG 2025.10-compatible form.

## Color rule
The legacy 20 palettes are seeds/directions, not complete themes. Generate light, dark, high-contrast-light, and high-contrast-dark semantic role maps. Use brand colors judiciously; reserve semantic status colors for status. Never rely on color alone to communicate state.

## Recipe rule
Choose a domain pack and experience recipe before styling. Never let visual template selection change the product's task model or navigation silently.

## Generic-AI UI prevention
Run `12_AESTHETIC_GUARDRAILS.md` as a lint gate. Reject indiscriminate cards, pills, gradients, glass, shadows, filler charts, fake metrics/testimonials, and desktop-to-mobile scaling without intentional transformation.

## Validation rule
The implementer may not certify its own work. A separate validator must re-read the frozen BuildSpec and current render, return PASS/FAIL/BLOCKED with evidence, and issue exact repair deltas. Repeat targeted repair at most five rounds. No hard-gate failure may be averaged away by an aesthetic score.
