# HC024C1 Build Report

- Build: `HC-024C1`
- Version: `0.24.3`
- Milestone: Deepen, Don’t Expand / Core Work
- Pass: Manipulation readability refinement

## Player evidence
Live HC024C testing confirmed the manipulation mechanics appear to work, but RT/LT inward/outward movement and selected-piece tracking are too subtle inside the translucent Core anatomy.

## Changes
- preserve the HC024C four-node prototype and physical mappings
- expand bounded radial range from the HC024C proof into a clearer 0.26–1.08 local radius
- increase radial response speed to 0.72 units/second input scale
- strengthen selected/held node material/scale separation
- dim nonselected binding anatomy while Guide is actively working
- align Guide’s attend pose with the selected piece’s Core-radial vector
- strengthen existing Guide shimmer during hold/depth motion
- expose depth percent, depth band, and inward/outward motion in the compact playtest readout

## Locked scope
- chemistry reactions: 0
- new recipes: 0
- new regions: 0
- new source modules: 0
- active JS source modules: 88
- new Core geometry: 0
- new Guide geometry: 0
- controller remap: 0
- progression changes: 0

## Lock test
The pass should lock only if live play can distinguish selected vs held state and can clearly see RT moving a piece outward and LT moving it inward without relying on guesswork.

## Validation result
PASS:
- HC024C1 readability contract
- HC024C manipulation regression
- HC024B Core Work view regression
- HC024A Core inspection regression
- HC023D HOTFIX1 and HC023D/HC023C/HC023B/HC023A chain
- RecipeDataSystem load validation
- undefined `this.method()` audit
- all 88 active source files pass `node --check`

## Runtime build note
The checkpoint intentionally ships without `node_modules`; production Vite bundling therefore remains a local playtest-machine check after `npm install`.
