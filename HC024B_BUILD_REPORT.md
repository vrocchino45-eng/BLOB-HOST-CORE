# HC024B Build Report — Guide-Assisted Core Work View

## Build identity
- Build: `HC-024B`
- Version: `0.24.1`
- Parent: `HC-024A Core Inspection / Camera Intimacy`
- Production rule: **Deepen, Don’t Expand**

## Purpose
Prove a third, Guide-assisted Core Work view before implementing any actual Core chemistry or piece manipulation.

## Implementation

### InspectionCameraSystem
- retains HC024A global Core-centered inspection
- adds `coreWorkActive` state without a new camera subsystem
- A/E enters Core Work only from true self-inspection
- B/Escape returns to external Core Inspection
- Y/F/V exits Core Work directly to world exploration
- authored world-focus assist is suppressed while Core Work is active
- chemistry and piece manipulation are explicitly reported as disabled

### InputSystem
- A/E is contextually captured as `coreWorkPressed` during Core self-inspection
- the same press is suppressed from `interactPressed`, preventing world-interaction leakage
- physical button mappings remain unchanged
- adds Core Work input audit telemetry for future playtest recording analysis

### OrbiterSystem
- reuses the existing Guide orbiter body
- Guide adopts `guide_attending_core_work`
- Guide targets `player_core_work_surface`
- existing shimmer line is reused as the visible Guide/Core relationship
- no Guide geometry was added

### CoreEmbodimentSystem
- adds a smoothed presentation-only `coreWorkReveal`
- existing outer membrane opacity softens
- existing inner mantle and nucleus become more readable
- no anatomy/chemistry/progression mutation is introduced

### GameRuntime
- remains the sole owner of actual camera transforms
- Core Work uses a closer third-person distance and narrower FOV
- work framing remains orbitable and world-continuous
- movement is not paused in HC024B

### Playtest HUD
- distinguishes Core Inspection from Core Work
- exposes the A → Guide Work, B → Core Inspection, Y → World flow
- clearly states that manipulation is reserved for HC024C

## Scope locks
Unchanged:
- geography
- active regions
- traversal topology
- movement physics
- collision
- progression
- living-state ownership
- chemistry recipes
- Core chemistry state
- accumulated-piece ownership
- physical controller mapping

## Validation results
`npm run validate:current` — PASS

Includes:
- HC024B contract — PASS
- HC024A regression — PASS
- HC023D HOTFIX1 — PASS
- HC023D — PASS
- HC023C — PASS
- HC023B — PASS
- HC023A platform audit — PASS
- undefined method audit — PASS

Additional:
- HC024B edited-file syntax chain — PASS
- RecipeDataSystem `loadAll` validation — PASS
- active source JS count: **88**

## Environment note
The supplied project checkpoint does not include `node_modules`. The Vite production bundle was therefore not used as the validation authority in this environment. Extract locally, run `npm install`, then `npm run dev` for the live visual test.

## Next only if live test passes
`HC024C — Guide Physical Piece Manipulation Prototype`

That pass should select/reposition only a very small number of already-existing accumulated Core pieces. It should not yet widen into a large crafting grid or recipe catalog.
