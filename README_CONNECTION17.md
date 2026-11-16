# CONNECTION17 — Silt Core visibility

Changed-files update for the CONNECTION15 playable build. CONNECTION16 was an audit, so it is not an installation prerequisite. Historical HC/LS1 identities remain intact.

## Install

Extract this ZIP beside package.json in your existing BLOB-HOST-CORE folder, then run:

```powershell
node .\APPLY_CONNECTION17.mjs --check
node .\APPLY_CONNECTION17.mjs --apply
```

Reload the game. Originals are preserved in CONNECTION17_BACKUP. Restore with `node .\APPLY_CONNECTION17.mjs --restore`. Check, apply, and restore refuse unrecognized or subsequent edits rather than overwriting them.

## Change

In Silt world view, decorative foreground rock inclusions and sediment beds become less opaque only when they interrupt the camera-to-Core corridor. They remain visible. Cavity walls and tunnels are excluded, preserving the surrounding space. The current contacted object's hierarchy is protected.

The exact original shared material is restored when the corridor clears, when leaving Silt, or when entering inspection/Core Work. A private material copy preserves the existing fog shader and prevents unrelated rocks sharing a material from fading. No geometry, collision, resource, targeting, movement, camera, verb, receipt, progression or audio rule changes.

The solve uses five rays over at most 64 cached decorative meshes, sampled at 100 ms of simulation time. The actual Silt fixture has 15 candidates. Root discovery retries are throttled. No whole-scene per-frame traversal or new render geometry is added.

## Pass contract

Mode: convergence. Purpose: improve Core silhouette visibility through existing Silt foreground sediment without dissolving the region.

Allowed scope: one existing presentation owner plus one dedicated presentation helper. Two optional root-level audit scripts accompany the update. Locked systems: all gameplay owners, input mapping, camera behavior, geometry, conservation, Host causes, progression, 3→6→12 architecture, timing limits and HC027D1 mix baseline.

Delete/disable targets: no systems or files deleted; only blocking decorative material opacity yields temporarily. Visual/feel target: follow the Core behind a foreground rock while retaining surrounding tissue and context. Full regional material separation, contact response, support-effect refinement and sound are later work.

Acceptance: shared-material isolation, protected-target preservation, exact restoration, off-region and inspection guards, actual-mesh before/after rendering, bounded solve cost, and unchanged gameplay observations. Regression: existing quick suite and real-input Core Work placement. Human motion/readability acceptance remains open.

## Human check

In ordinary Silt world-view movement, pass behind a foreground rock and turn the camera around the Core. Only the obstructing sediment should soften; it should return as the view clears. Enter inspection and Core Work, then return to world view. Cavity walls, tunnels, resources and contacted objects should retain their appearance. A short focused check is enough.

This update does not claim to fix the historical whole-Silt disappearance. It changes no region visibility flag. The controlled visual comparison paused background preparation scheduling and waited for running preparation to finish before staging the view; a preparation overlap encountered during test setup is not declared a reproduced human disappearance bug.

## Validation

See RESULTS_CONNECTION17.md and CONNECTION17_EVIDENCE. Internal comparison screenshots were inspected during implementation; they are not included in this package. The two optional CONNECTION17_VISIBILITY_*.mjs scripts run from the project root. The browser script needs Playwright and Chromium; BLOB_VISIBILITY_REPORT selects its report destination. It uses explicit test poses and paused animation, so it is not a natural-play acceptance test.
