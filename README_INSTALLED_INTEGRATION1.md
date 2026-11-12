# BLOB — authored Silt input/route integration checkpoint

## Outcome

The supplied integration snapshot verifies all 703 exported file hashes and contains authored recipes and dependency declarations. None of those 703 files changed during this pass.

New headless integration: 9/9 checks pass through real InputSystem.update -> full SiltPressureRouteSystem.update, with the actual RecipeDataSystem.loadAll recipes, real authored Silt geometry initialization and real Three.js 0.179.1. The original safe-packet-completed flag is staged as prior progress. Core positions and the initial held-grain contact position are controlled fixtures. The cycle itself supplies the settled grain. No route method is extracted or substituted; no renderer is created.

The checked chain includes actual normalized Q/commit input, acquisition, same-update material ownership reconciliation, withholding held/seated grain from ecology, normalized Pulse release and braced imprint, seating, extraction, Core Work input suppression and unmount cleanup. This does not prove physical device delivery, the player movement controller, overall SystemRegistry scheduling, earning initial safe-packet progression, rendering or human readability.

Existing checks rerun on this snapshot: adapter C1 13/13, real adapter -> Guide Stage2B 11/11, camera/selection controlled suite 12/12. Some assertions overlap across suites; these counts are separate scopes rather than a count of unique behavior contracts.

Production Vite build: PASS, 165 modules transformed. The main minified JS chunk is approximately 2.69 MB (about 695 KB gzip), producing the existing >500 KB chunk-size warning. This pass does not change chunking or equate a successful build with browser playability.

## Dependency provenance

The snapshot records user Node v24.14.0 and installed Three.js 0.179.1. Its lockfile specifies Three.js 0.179.1 and Vite 7.1.0. Validation uses Node v24.22.1, Three.js 0.179.1 and Vite 7.1.0.

A full npm ci attempt failed with HTTP 503 downloading tinyglobby from the package server. Exact direct dependencies were then installed in a separate validation directory and linked into the reconstructed snapshot. Build and tests succeeded there. This is direct-dependency parity, not proof of complete transitive lockfile parity or a clean npm ci installation. No dependency declaration/lockfile is edited or delivered for installation.

## Delivery

This ZIP is a validation checkpoint: reusable new integration harness, local JSON reports and summary. It contains no gameplay patch and no replacement src/data/config files. No installation or repeated playthrough is needed for this checkpoint. Historical IDs are preserved. The earlier intermittent Silt visual disappearance remains open, with reproduction deferred by the user.

The included harness can be reused after a future production edit by copying SILT_INSTALLED_INTEGRATION1.mjs to the repository root and running in PowerShell:

```powershell
node ./SILT_INSTALLED_INTEGRATION1.mjs > ./SILT_INSTALLED_INTEGRATION1_REPORT.json
```

It reads authored JSON locally by temporarily providing a local-file fetch adapter only while RecipeDataSystem.loadAll executes; the original global fetch is restored afterward. It does not access the network or modify production files. Test actions are injected into the InputSystem's existing key/queued state and then normalized by its actual update method. It does not test browser key listeners or physical gamepad events. Scenario setup prerequisites abort if no naturally settled grain is available rather than fabricating a passing case.

## Pass contract

Mode: Convergence / validation.

Purpose: close the previously unverified authored-data and input -> full Silt route -> ownership reconciliation boundary.

Allowed scope: verify export hashes, reconstruct isolated dependencies, load actual authored recipes, full route tests and production build, evidence delivery.

Forbidden scope: gameplay changes, geometry/contact expansion, update reordering, new features, dependency upgrades in the user's game and speculative disappearance fixes.

Locked systems: all exported source/data/config; Guide C1 fix; movement, controls, camera/audio; authored eight-grain cycle and 3->6->12 grammar.

Delete/disable targets: none. Temporary browser diagnostic wrappers are removed by a fresh reload during ordinary play.

Visual/feel targets: current game remains unchanged; validation does not certify human feel.

Acceptance completed: 703 hashes verified; authored Silt initialization and nine route pipeline cases pass; C1/Stage2B/selection reruns pass; production build exits zero; all exported bytes preserved.

Outstanding acceptance: browser renderer, human readability and feel; physical devices; full GameRuntime/SystemRegistry phase timing; player/contact movement integration; complete clean lockfile restore. The rapid recovery -> deliberate release Guide live semantic case remains separately open. These tests do not silently close it.

Next: use this pinned snapshot for a focused browser/world-input integration check and a short human material loop when ready. No new feature milestone is automatically unlocked by headless passing tests. If the intermittent disappearance recurs, use the preserved diagnostics and evidence rather than a speculative visibility patch.
