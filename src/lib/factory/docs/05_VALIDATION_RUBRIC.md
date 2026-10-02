# VALIDATION RUBRIC

A release-ready BuildSpec requires all mandatory gates to PASS.

## 1. Visual coherence
- One coherent token system.
- No conflicting radius, shadow, spacing, icon, or typography families without an intentional scoped exception.
- Selected mobile and desktop patterns have a defined relationship.

## 2. Responsive behavior
Validate at 390, 768, 1280, 1440, 1920 widths. No horizontal overflow except intentional data surfaces. Navigation, filters, inspectors, tables, and multi-pane views use their defined transformations.

## 3. State coverage
Every interactive/data component has required default, loading, empty/no-results, error, disabled/permission, and success states where applicable.

## 4. Accessibility
WCAG AA contrast for body text and controls, visible focus, semantic structure, labels, keyboard operation, non-gesture alternatives, reduced motion, screen-reader names/status behavior.

## 5. Content safety
No invented testimonials, customers, revenue, usage metrics, certifications, addresses, guarantees, or live-looking personal data. Use explicit [PLACEHOLDER_TOKENS].

## 6. Motion
Motion must explain hierarchy, state, causality, continuity, or feedback. Reduced-motion fallback is mandatory.

## 7. Performance intent
Image aspect ratios and responsive delivery specified; avoid unnecessary autoplay/video/background effects; lazy-load below-fold media; define skeletons for data waits.

## 8. Reference Lock parity
When a reference is locked, compare section order, layout, typography roles, spacing rhythm, radius, color ratios, image placement, controls, and responsive behavior. Any intentional deviation requires a VarianceRequest.

## Result
Return PASS / FAIL / BLOCKED with evidence. No evidence = no PASS.


## 9. Token purity
- Raw visual values are confined to the primitive/source token layer.
- Components consume semantic or component tokens.
- Flag arbitrary color, spacing, radius, shadow, typography, or icon-family drift.

## 10. Experience recipe integrity
- Page/screen order, navigation, primary task, and required states match the frozen recipe.
- Styling changes cannot silently change information architecture.

## 11. Platform authenticity
- Interaction conventions match the selected platform adapter.
- Do not mix unrelated mobile/desktop interaction languages without an explicit documented reason.

## 12. Aesthetic restraint
- No indiscriminate cards, pills, gradients, glass, shadows, or motion.
- Visual emphasis maps to task hierarchy.
- Imagery, typography, proportion, and rhythm carry the design before decoration.

## 13. Visual regression
- Compare frozen baselines across required viewports and critical states.
- A perceptual similarity score is supporting evidence, not sole proof.

## 14. Independent validation and repair
- Implementer does not self-certify.
- Repairs target exact deltas only.
- Maximum automatic repair rounds are pinned in the project config; unresolved hard-gate failures return BLOCKED.
