# AUTOMATION + CONSISTENCY LINTER

## Automated input
The builder may accept:
- natural-language product brief
- approved brand pack
- screenshot/mockup/reference site
- existing code/design token set
- product/domain choice

## Automatic inference, with receipts
The system may infer domain pack, recipe candidates, density, navigation, and platform adapter. Every inference is recorded and remains editable before freeze.

## Consistency linter
Reject or warn on:
- raw colors outside primitive tokens
- arbitrary spacing, radius, shadow, font size, or z-index proliferation
- mixed icon families
- inconsistent card anatomy
- unstable navigation labels/order
- decorative gradients/glass/pills without a system role
- excessive accent usage
- missing loading/empty/error/permission/success states
- unsupported responsive collapse
- inaccessible focus/contrast/target behavior
- fake testimonials, metrics, addresses, or other live-looking invented data

## Self-repair loop
1. Generate.
2. Validate independently.
3. Produce exact deltas by screen/component/property.
4. Apply targeted repair only.
5. Re-render affected viewports/states.
6. Revalidate.
7. Repeat up to configured limit, then return BLOCKED with unresolved evidence.

## Learning without silent drift
Store operator selections and validator outcomes as **recommendation weights**, not automatic registry mutations. Pattern definitions change only through versioned registry updates with changelog and validation.
