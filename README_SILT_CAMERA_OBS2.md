# SILT-CAMERA-OBS2 — cave shell comparison

The OBS1 report records no whole-root hiding, stable Silt position/scale and repeated successful attachment. The current source authors cave shells with BackSide materials and only one explicit crawlable test shelf. OBS1 did not capture the camera. This pass tests sidedness as a visual cause without claiming it is established.

Copy SILT_CAMERA_OBS2.mjs into the repository root. Start on a freshly reloaded game page to remove older temporary observers. Before entering Silt, in the GAME BROWSER F12 -> Console, run:

```javascript
await import('/SILT_CAMERA_OBS2.mjs')
```

Enter Silt. While it looks correct, optionally record a reference:

```javascript
__BLOB_SILT_CAMERA_OBS2__.capture()
```

Release as usual. When Silt appears missing, run:

```javascript
__BLOB_SILT_CAMERA_OBS2__.showExteriors()
```

Return focus to the game and look from the SAME position before moving. Does the missing cave shell become visible? A changed shader can cause a brief compilation hitch on the first comparison frame. This is a temporary diagnostic visual mode, not a production fix.

Then export in the BROWSER Console:

```javascript
__BLOB_SILT_CAMERA_OBS2__.download()
```

Upload SILT_CAMERA_OBS2_REPORT.json and state whether the missing geometry came back, partly returned, or stayed missing. No long recording is required. Restore the original visual mode:

```javascript
__BLOB_SILT_CAMERA_OBS2__.stop()
```

Reload also removes the comparison. If routeCount is zero, the route update has not been observed; export that result rather than drawing a conclusion from the toggle.

## Contract

Mode: Audit. Purpose: distinguish cave-shell face culling from other rendering/framing causes. Allowed scope: additive opt-in browser diagnostic; temporary material-side changes for named irregular inward stone strata only; camera/player and material snapshots. Locked/forbidden: movement, attachment metadata, Guide adapter, surface registration, authored geometry, controls, camera settings, gameplay state, world content and progression. Delete/disable targets: none; stop/reload removes the observer. Visual target: compare the same shell from the same camera before/after showing exterior faces. Feel target: unchanged gameplay.

Acceptance: capture includes observed Silt route, camera/player positions and before/after material sides, plus the user's visual result. Regression: no production source files replaced; original sides restored on stop; unrelated materials untouched. No automated PASS/FAIL or collision proof is claimed. Local Node syntax check passed. Browser comparison remains pending.

Next: if exterior rendering restores the missing shell, inspect the camera's relation to cave boundaries and choose a bounded presentation repair. If it does not, examine the captured view/framing and pursue the remaining rendering causes. Do not wholesale enable attachment on decorative cave walls; that is a separate mechanics decision.
