# HC024C Build Report

- Build: `HC-024C`
- Version: `0.24.2`
- Milestone: Deepen, Don’t Expand / Core Work
- Pass: Physical Core Piece Manipulation

## Purpose

Prove physical Guide-assisted rearrangement of existing Core anatomy before assigning any chemistry meaning to arrangement.

## Implementation

### Piece set
- reuses the four existing `player_growth_connection_node_*` meshes
- no new source module
- no new piece geometry
- candidates are selectable only when already visible through authored Core growth

### Controls
- D-Pad Left/Right: cycle visible candidate
- A/E: grab/place
- Left Stick/WASD: camera-relative planar piece movement
- RT/LT: outward/inward radial movement
- Right Stick/IJKL: camera orbit remains independent
- B/Escape: return to Core Inspection
- Y/F/V: return to World

### Guide embodiment
- existing Guide body moves toward the selected node
- existing shimmer line terminates on the selected node
- held/unheld states are visible through Guide reaction and node emphasis

### Persistence
- node placement is represented by runtime placement offsets
- offsets remain visible after leaving Core Work
- no save-system persistence is claimed

### World-input suppression
- Core Work suppresses traversal input and world pulse/absorb/stabilize actions
- existing world simulation is not hard paused
- PlayerMovementController remains unchanged

## Locked scope

- chemistry reactions: 0
- new recipes: 0
- new regions: 0
- new source modules: 0
- active JS source modules: 88
- new Core geometry: 0
- new Guide geometry: 0
- progression changes: 0

## Validation result

PASS:
- HC024C physical manipulation contract
- HC024B Core Work foundation regression
- HC024A Core inspection regression
- HC023D HOTFIX1 import/debug restore
- HC023D living-state Hub echo
- HC023C Guide living-state continuity
- HC023B Surface living states
- HC023A platform audit
- undefined `this.method()` audit
- HC024C touched-source syntax audit
- RecipeDataSystem load validation including HC024C inspection-profile compatibility

## Runtime build note

The checkpoint intentionally ships without `node_modules`. Source/static validation is green; local Vite execution still requires installing dependencies on the playtest machine.

## Next decision

Do not automatically implement chemistry after this build. First test whether selecting, grabbing, moving, placing, and externally inspecting the rearranged nodes feels tactile/readable. If it does, HC024D may attach at most two temporary chemistry reactions with counter-pressure.
