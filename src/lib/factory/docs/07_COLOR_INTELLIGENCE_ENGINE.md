# COLOR INTELLIGENCE ENGINE

## Why v2 changes color
The 20 v1 palettes remain useful as starter directions, but a static palette is not enough for a reusable app factory. v2 treats color as a generated semantic system.

## Deterministic pipeline
1. Accept one or two approved brand/source colors, or select a registry seed.
2. Choose working model: HCT for Material-oriented output; OKLCH-style perceptual generation for general web/design exploration; always emit sRGB-compatible canonical fallbacks.
3. Generate tonal scales for primary, secondary, tertiary, neutral, neutral-variant, and semantic status families.
4. Map tones to semantic roles, never directly to component names like `blueButton`.
5. Generate light, dark, high-contrast-light, and high-contrast-dark role maps.
6. Test required text/control/status contrast pairs and repair role tone assignment if they fail.
7. Test grayscale/color-deficiency legibility heuristically and require shape/text redundancy for status.
8. Export DTCG-compatible primitive + semantic + component token layers.

## Color ratio discipline
- Canvas/surfaces: 70-90% of interface area.
- Brand/accent: normally 5-15%.
- Status colors: only where semantically required.
- Do not use the primary brand color for every control.
- Do not use the same color role to mean both interactive and decorative content.

## Wide-gamut strategy
Use sRGB as the broad-compatibility canonical output. Optional Display-P3 enhancements may be generated for capable displays, but must have an sRGB fallback and cannot carry unique semantic meaning.
