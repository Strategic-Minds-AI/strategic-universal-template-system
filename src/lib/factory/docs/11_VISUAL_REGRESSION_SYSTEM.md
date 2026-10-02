# VISUAL REGRESSION SYSTEM

For every frozen project, store baseline screenshots for required device profiles and critical component states.

## Compare four dimensions
1. Structural: route, section order, component presence, bounding regions.
2. Token: colors, type roles, spacing, radius, elevation, icon family.
3. Perceptual: screenshot-diff / similarity evidence.
4. Behavioral: navigation, forms, loading, errors, responsive transformations, keyboard/touch behavior.

A screenshot similarity number alone is never enough. A visually similar build can still have wrong interaction behavior, inaccessible focus, fake content, or incorrect tokens.

## Default validation matrix
- 390 mobile
- 768 tablet
- 1280 laptop
- 1440 desktop
- 1920 wide desktop
- light + dark where supported
- at least one loading, empty, error, and success state for critical flows

When Reference Lock is enabled, target >=95% layout similarity to the approved reference while preserving original assets/copy rules and recording intentional variances.
