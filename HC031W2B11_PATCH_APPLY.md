# HC-031W2B1.1 Patch Apply

**Apply over:** `HC-031W2B1 — Depth Hierarchy Foundation`.

Replace these project files with the copies in this patch:

- `src/morph/GuideThresholdGameplaySystem.js`
- `src/morph/GuideThresholdLayeredInteractionSystem.js`
- `src/hub/HubChamberFoundationSystem.js`

Optional validation helper:

- `scripts/validateHC031W2B11CameraRelativeHierarchyBalance.mjs`

After applying, restart Vite and hard-refresh/fresh-tab the game.

## Focused visual test
Run roughly 3–5 minutes through Surface Wake → Scar/Guide → Hub. No long telemetry session is needed.

Check:
- Surface Wake looks unchanged.
- Guide/Scar has faint continuous living-current context between interactions, but does not return to a cyan wall.
- Local pressure/focus objects, Core, and Guide still dominate the eye.
- Large Hub tissue close to the camera fades down automatically and returns toward authored strength as it moves farther away.
- Hub route/amber structures remain readable through nearby tissue.

Export Shift+T JSON at the end if convenient; video is the primary acceptance evidence for this pass.
