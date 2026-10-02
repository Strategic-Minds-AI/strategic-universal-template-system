# RECIPE-BASED TEMPLATE SYSTEM

v2 separates **visual style** from **experience structure**.

## Layer hierarchy
1. Tokens — color, type, spacing, radius, elevation, motion.
2. Primitives — button, input, icon, text, image, divider.
3. Components — card, list row, nav, dialog, form field, table, chart.
4. Patterns — search/filter, checkout module, media viewer, comments, KPI group.
5. Experience recipes — complete screen/page and flow grammar.
6. Domain packs — constraints for SaaS, ecommerce, local service, AI, social, CRM, etc.
7. Platform adapters — web, PWA, iOS-like, Android-like, tablet, desktop.
8. Reference lock — approved visual source overrides aesthetic freedom without overriding accessibility/safety requirements silently.

## Why recipes beat templates
A template is easy to copy but also easy to drift. A recipe declares required slots, allowed substitutions, states, responsive transforms, density, hierarchy, and incompatibilities. Styling can change while the experience remains coherent.

## Each recipe must declare
- primary user task
- screen/page map
- navigation contract
- above-the-fold hierarchy
- required components
- optional modules
- required states
- content density
- mobile transform
- desktop transform
- telemetry events
- acceptance tests
