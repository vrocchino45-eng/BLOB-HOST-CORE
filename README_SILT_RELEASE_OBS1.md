# SILT-RELEASE-OBS1 — disappearance capture

## Findings from the supplied current source

The uploaded BLOB_CURRENT_SRC.zip is the audit baseline. SiltPressureRouteSystem mounts its root at the player entry anchor; unmount hides it. PlayerMovementController release does not directly call that route's visibility switch. CoreSurfaceTruthSystem excludes meshes beneath a hidden ancestor, so hiding an authored root can remove both rendering and attachment candidates. This is a possible mechanism, not a confirmed reproduction. Render-budget and transition systems also temporarily change visibility and restore it around rendering. They must not be disabled without evidence.

No production repair is included because the current static audit has not established which action causes the reported disappearance.

## Install and reproduce once

Copy only SILT_RELEASE_OBS1.mjs and SILT_RELEASE_OBS1_CORE.mjs into the BLOB-HOST-CORE repository root. Do not replace any src files. Start the game on a fresh browser page so previous temporary observers are removed.

In the GAME BROWSER's developer tools (F12 -> Console), run:

```javascript
await import('/SILT_RELEASE_OBS1.mjs')
```

Enter Silt with its surfaces visible. Attach, release once, then try to reattach. As soon as the surfaces disappear, return to the same browser Console and run:

```javascript
__BLOB_SILT_RELEASE_OBS1__.download()
```

Upload SILT_RELEASE_OBS1_REPORT.json. No long playthrough or Guide experiment toggle is needed. To inspect whether the route was found before testing, run:

```javascript
__BLOB_SILT_RELEASE_OBS1__.dump()
```

`current` should contain a route after Silt has updated. If it stays empty while you are in Silt, export anyway; do not repeatedly play a long session. If an import fails, send its exact error.

Reload to remove observation, or stop it with:

```javascript
__BLOB_SILT_RELEASE_OBS1__.stop()
```

## What it records

- Real attachment changes and current authored surface truth.
- Silt route update exceptions, with original exceptions rethrown.
- Writes to the route root's visible property, including caller stacks and current cell.
- Route/root state, parent, transform, crawlable proof mesh visibility, material opacity, contact-disabled flags, hidden ancestor names and invalid transforms.
- Up to 300 events and the most recent 90 once-per-second route snapshots. Event overflow is explicitly counted.

The observer temporarily wraps production methods and the root visibility property in memory. It forwards original method calls and assignments; it never chooses controls, changes attachment state, samples the Guide adapter or makes surfaces visible. Stop restores its own wrappers while retaining the latest visibility value. Root visibility stacks identify root writes only; descendant visibility and material conditions are summarized, not traced to every writer. The report does not claim PASS/FAIL or prove collision behavior.

## Pass contract

- Mode: Audit. Milestone: restore repeatable Silt attach -> release -> reattach.
- Purpose: identify the live disappearance trigger before selecting a repair.
- Allowed scope: additive opt-in diagnostics and source inspection.
- Forbidden scope / locked systems: production movement, region activation, Guide adapter fix, physics, camera, rendering policy, controls, audio, chemistry and content.
- Inspected files: SiltPressureRouteSystem, PlayerMovementController, CoreSurfaceTruthSystem, GameRuntime, RenderBudgetSystem, FirstSliceTransitionCoordinator, camera and local visibility paths in the current src archive.
- Delete/disable targets: none until the owner of the failure is established; reload removes the observer.
- Visual/feel target: preserve existing behavior while capturing the failure.
- Acceptance: one disappearance capture includes Silt route snapshots, attachment transition and surface/visibility evidence sufficient to target the next repair. Empty coverage is incomplete.
- Regression: production arguments, return values, errors and assigned visibility values are preserved; stopping restores method/property ownership where still held by this observer.
- Next: patch the evidenced owner, then verify repeated release/reattachment before resuming the Guide test.

## Local validation

Node syntax checks and the included observer self-test passed. The self-test uses small synthetic classes and verifies visibility caller capture, detachment records, return values, exception propagation and restoration. It is not a production reproduction.

Optional PowerShell check:

```powershell
node ./SILT_RELEASE_OBS1_SELFTEST.mjs
```

Browser reproduction remains pending. Only the two diagnostic modules are required for capture; the self-test and this document are optional installation files.
