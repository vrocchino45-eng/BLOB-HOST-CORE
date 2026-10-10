# HC-031W2B2 — Pulse/Sonar Spatial Reveal

## Mode
Visual-language convergence only.

## Purpose
Make Pulse behave visually like embodied sonar that temporarily organizes the Host rather than repainting nearby geometry as a uniform bright wireframe cage. This is the second boxed W2B pass after the B1.1 static depth-hierarchy lock.

## Changes
- Keeps `CoreSensoryResponseSystem` gameplay/sensory authority unchanged.
- Quiets the outgoing Pulse front so it reads as emission rather than the primary visual answer.
- Adds distance/stage-tiered contour reveal:
  - local stage 1/2/3: up to 2/3/4 mesh fragments,
  - deep stage 1/2/3: 1/2/3 mesh fragments,
  - deep stages read as `deep_fragment -> deep_layer -> deep_relation`.
- Repeated reads refresh one target contour instead of stacking duplicate cages.
- Contour child meshes phase on progressively rather than appearing as one simultaneous wireframe shell.
- Local contours carry more opacity than distant/deep contours; distant structure stays fragmentary.
- Sonar return motes begin quieter and become stronger while travelling back toward the Core, making the return direction the primary Pulse cue.
- VisualHierarchyCompression now ranks Pulse information as: target material response -> return/local relationship change -> outgoing spheres/rings/distant wireframes.
- Existing A2 transient budgets remain unchanged: 3 contours, 4 meshes/contour, 180 segments/mesh, 3 fronts, 10 return motes.

## Locked / forbidden scope
B1.1 static opacity/camera-relative hierarchy is locked. No Pulse gameplay range, power, echo timing, target authority, movement, controller mapping, camera, chemistry, route/progression, new geometry budget, or W2A timing architecture changes.

## Validation
PASS:
- `validateHC031W2B2PulseSonarSpatialReveal.mjs`
  - verifies sensory-authority locks, distance/stage tier resolver, actual 2->4 local contour construction, 1-fragment deep first read, duplicate-contour refresh, phased child reveal, and return-mote intensity direction.
- `validateHC031W2B11CameraRelativeHierarchyBalance.mjs`
- `validateHC031W2A54PrimedChildLiveAdmission.mjs`
- `smokeHC031W1StabilizedAimLocalContact.mjs` (includes LT+RS redirect)
- `validateHC031W1HF1TargetClear.mjs`
- `smokeHC031T5RidgeTraceFrameRate.mjs`
- `validateRecipeDataLoad.mjs`
- `auditUndefinedThisMethods.mjs`
- JS syntax checks for both changed source files and W2B2 validator.

Inherited validation caveat:
- `validateHC031W1StabilizedAimLocalContact.mjs` still stops on the documented W2A1 parent-hash drift in `src/player/CoreSurfaceTruthSystem.js`; W2B2 does not touch that file.

Environment build caveat:
- `npm run build` reaches the same inherited Rollup failure because the supplied Windows `node_modules` archive does not contain `@rollup/rollup-linux-x64-gnu`. This is not a W2B2 regression and is not counted as a production build pass.

## Acceptance
Primary evidence is video. Lock W2B2 if Pulse clarifies near/far anatomy and the contact/return relationship without recreating a full-screen wireframe wash. Repeated reads must feel like additional structural resolution, while the B1.1 hierarchy remains readable between pulses. If accepted, continue to **W2B3 — Verb/Target Relationship Grammar**.
