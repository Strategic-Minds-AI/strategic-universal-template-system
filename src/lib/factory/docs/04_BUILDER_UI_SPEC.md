# BUILDER UI / FRONTEND SPECIFICATION

## Visual ceiling
The builder itself should feel like a professional design/development tool: high information clarity, restrained chrome, fast filtering, excellent keyboard/mouse ergonomics, and a large preview canvas. Use an enterprise app shell rather than a marketing-site layout.

## Main screen
### Top bar (56-64px)
Left: product mark + project selector. Center: mode, platform, breakpoint, theme. Right: seed, Validate, Export, overflow.

### Left navigation rail (64px collapsed / 220-260px expanded)
Project, Screens, Sections, Components, Brand, Colors, Logos, Type, Media, Motion, States, Data, Export.

### Library browser (280-360px)
Search, filter chips, compatibility toggle, favorites, pattern cards. Each pattern card shows: name, family, best-for tags, compatibility score, selected/frozen status.

### Canvas
Neutral checker/solid backdrop, responsive frame presets, zoom 25-200%, rulers optional, compare mode. Never stretch a phone design into desktop; switch to defined responsive transformation.

### Inspector (320-380px)
Tabs: Properties / Tokens / States / Responsive / Accessibility / Source. Locked properties show lock icon and source-of-truth reference.

### Validation drawer
PASS/FAIL/BLOCKED by category with exact failing component/screen/token and prescribed correction. Preserve receipts by BuildSpec hash.

## Preview widths
390 mobile, 768 tablet, 1280 desktop, 1440 desktop, 1920 wide desktop. Allow custom sizes.

## Interaction rules
- All changes update a draft BuildSpec first.
- User can undo/redo.
- Freeze applies to pattern, token group, screen, or entire project.
- Export is blocked when required validation is FAIL.
- Brand Mode stops after presenting the required 3/3/3 options.
