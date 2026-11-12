# SILT-SELECTION-INTEGRATION1 — camera/grip/extraction checkpoint

## Results

12/12 selection integration checks pass. The full production SiltPressureRouteSystem module is evaluated with real Three.js camera and transform classes; its real constructor and updateSiltGrip execute against controlled scene/units. No production method text extraction is used by this suite.

The 8 earlier release/unmount scenarios also pass through the full imported route module's real prototype methods. Their controlled fixtures still replace presentation callbacks and avoid full route.update/renderer execution. They are reported separately as SILT-RELEASE-INTEGRATION1. This supersedes the method-isolation limitation for module loading only; it does not turn those fixtures into authored-world evidence.

Validation dependency: Three.js 0.170.0, revision 170, installed only in an isolated local validation directory. This version is NOT asserted to match the user's installation. No package.json, lockfile or node_modules change is delivered for the game. All 173 production files in the supplied source archive remain byte-identical.

## Selection checks

- Camera alignment selects the farther centered grain over a closer off-axis grain.
- Translated and rotated route coordinates preserve the selected local grain.
- Out-of-range and outside-cone candidates cannot be acquired.
- Hidden grain body is excluded.
- Acquisition requires commit plus Stabilize.
- Changing the camera candidate does not redirect the already committed grip.
- A new distant grip gains outward headroom while preserving Core position and total material mass.
- A naturally close grain is not pushed outward.
- Seated extraction inside the leash preserves exact position and identity, clears seating and begins held trajectory history.
- A seated grain beyond the 1.59 local extraction gate stays seated.
- Extraction does not repeat when no new commit is supplied.

The tests supply eight controlled material identities, visibility and route-local positions. RecipeDataSystem is a controlled constructor fixture; authored init, habitat geometry and world rendering are not run. These tests demonstrate math/selection contracts, not visual target clarity or feel.

## Source review: input and ledger timing

InputSystem suppresses world interactPressed, absorbHeld and stabilizeHeld in Core Work context. The route's pure grip helper also has a coreWork argument, but updateSiltGrip relies on normalized inputs rather than passing that context directly. The inspected publication therefore provides an existing suppression path; missing the helper argument alone is not grounds for a speculative gameplay patch. InputSystem -> route timing remains a combined test target.

Normal route.update reconciles materialIdentity ownership immediately after updateSiltGrip, then advances the cycle with held and seated IDs withheld. The new selection fixtures inspect acquisition/extraction but do not execute this complete orchestration. Do not claim ledger integration is established merely because selected and held IDs match.

## Pass contract

Mode: Audit / Convergence.

Purpose: qualify camera-aligned material selection and seated extraction using the actual route module and real 3D math.

Allowed scope: isolated validation dependency, additive test harnesses, controlled scene fixtures, source inspection and evidence.

Forbidden scope: gameplay code edits, source dependency changes, camera/control remapping, recipe/geometry changes, update reordering, surface eligibility expansion and new content.

Locked systems: all production files, existing Guide fix, player movement/contact laws, authored material count, camera/audio and 3->6->12 grammar.

Delete/disable targets: none. Reloading the browser removes older temporary diagnostic wrappers; this package installs no browser observer.

Visual/feel target: existing game behavior preserved; no live render change.

Acceptance: 12 selection checks plus 8 full-module release checks pass, dependency revision and route hash recorded, production source unchanged. Completed within the controlled fixture scope.

Regression: committed grain identity, mass, no duplicate extraction/Host observation, range/leash gates, seated/free exclusion and original Core position.

Next integration gate: execute normalized input -> route.update -> ownership reconciliation under the installed dependencies and authored recipes, then check human readability. The full repository dependency manifest/lockfile and authored data are not present in this source subset; match those before claiming installed-build parity. This is a gate for full integration, not a request to repeat existing unchanged passing tests.

## Open items retained

- Intermittent Silt disappearance remains open and reproduction is deferred by user choice. No disappearance hunt is required.
- Guide C1's controlled regression (13/13) and adapter/Guide suite (11/11) remain valid in their separate scopes. These new tests do not close the remaining rapid-release live Guide acceptance gap.
- Renderer/occlusion, actual authored geometry and recipe, input phase timing, full route update and human movement/camera/controller/audio feel remain unverified here.

## Optional reuse

No installation or playtest is needed now. The ZIP contains test scripts and this environment's LOCAL_REPORT results only. For future code edits, copy either test script to the repository root and use the project's EXISTING dependencies:

```powershell
node ./SILT_SELECTION_INTEGRATION1.mjs > ./SILT_SELECTION_INTEGRATION1_REPORT.json
node ./SILT_RELEASE_INTEGRATION1.mjs > ./SILT_RELEASE_INTEGRATION1_REPORT.json
```

Do not install or upgrade Three.js in the game to match this checkpoint. The selection report records the dependency revision it actually loads and the route's SHA-256 hash.
