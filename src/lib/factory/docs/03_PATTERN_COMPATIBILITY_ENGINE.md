# PATTERN COMPATIBILITY ENGINE

## Goal
Prevent arbitrary template mixing. A project may only select pattern combinations that pass hard constraints and reach the compatibility threshold.

## Inputs
- platform(s)
- product archetype
- primary user goal
- secondary goals
- information density: low / medium / high
- interaction mode: browse / create / transact / monitor / communicate / analyze
- conversion mode: none / signup / purchase / lead / booking / quote
- brand tone
- content/media intensity
- accessibility needs
- reference-lock status
- deterministic seed

## Hard constraints
1. A mobile navigation choice must have a defined desktop/tablet transformation.
2. Full-screen swipe feed cannot be the primary layout for dense admin/data products.
3. Dense table/command-center layouts cannot be used as the phone default.
4. Hover-only interactions are forbidden.
5. Motion patterns must include reduced-motion behavior.
6. Any visual reference in Reference Lock mode outranks general style selection.
7. A selected palette must pass contrast checks before acceptance.
8. A selected logo pattern must have icon-only and one-color variants.

## Compatibility score (0-100)
- platform fit: 25
- primary-goal fit: 20
- information-density fit: 15
- navigation/layout fit: 10
- brand-tone fit: 10
- conversion-path fit: 10
- accessibility fit: 5
- motion/media fit: 5

Eligibility threshold: 75. Hard-constraint failure = ineligible regardless of score.

## Deterministic tie-break
1. Sort eligible patterns by score descending.
2. Stable sort ties by pattern ID.
3. Use the project seed only to choose among exact-score ties.
4. Store selected IDs, registry version, and seed in the BuildSpec.
5. Re-running the same BuildSpec and registry version must return the same selection.

## Reference Lock
When an approved screenshot/mockup exists, extract: layout, grid, spacing, radius, shadows, typography roles, color ratios, image treatment, nav, CTA, component order, motion, responsive behavior. Lock these as constraints. Do not redesign without an explicit variance approval.
