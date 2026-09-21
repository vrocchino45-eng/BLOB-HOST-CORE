# HC-028B1 Build Report — Transition Resolution + Convergence Reachability

## Purpose
Repair two progression blockers observed in the HC-028A1 playtest without widening gameplay scope:

1. Completed Vascular and Silt routes still required button-searching at their return folds.
2. After route completion, the Core could become physically unable to converge on the Signal Chorus center and instead circulate around it.

## Root Cause Found
The second issue was not just excessive generic current strength. Silt chemistry can retain membrane adhesion after returning to Hub. The movement controller's attachment response removes radial velocity against the trusted boundary. In Hub convergence this can convert deliberate inward input into tangent/circling motion.

The Vascular and Silt return recipes also explicitly used `interact` triggers after route completion, matching the observed A/E button-search behavior.

## Implemented Scope
- Vascular and Silt resolved return folds now use proximity entry after their route completion state has opened the fold.
- Grave return behavior is unchanged and remains interaction-driven.
- Hub convergence publishes its authored center/radii to movement and telemetry.
- During an active, unresolved Hub convergence approach:
  - retained membrane adhesion cannot pin the Core to the boundary;
  - environmental flow authority progressively yields near the convergence center;
  - both direct flow acceleration and the fluid-drag reference are scaled by the same envelope;
  - player position is never teleported or forced.
- Normal movement remains sufficient. Stabilize is not required.
- Telemetry v1.2 now records route resolution/release/availability/entry, desired/environment/final movement vectors, convergence envelope, route state, and sustained progress blocking.

## Scope Locks
- No new regions or geometry.
- No new chemistry states.
- No Pulse/Absorb/Stabilize redesign yet.
- No controller remap.
- Grave route source/recipe behavior remains unchanged.
- Runtime source JS count remains 93.

## Validation Completed
- `validateHC028B1TransitionResolutionConvergenceReachability.mjs`: PASS
- Undefined `this.method()` audit: PASS
- Recipe data load validation: PASS
- `node --check` on all modified runtime JS: PASS

## Environment Limitation
The uploaded HC-028A1 source archive does not contain `node_modules`. Dependency restoration could not complete in this sandbox, so an honest Vite production build could not be executed here. Static/syntax/project validators above were run instead. The package contains source only, consistent with the uploaded source archive.

## Focused Playtest
Use `HC028B1_FOCUSED_PLAYTEST.md` for the next test. The critical acceptance test is that Vascular/Silt visibly resolve and return by movement into the fold, then Hub convergence can be entered deliberately without getting trapped in the previous ~3.6–3.9 orbit band.
