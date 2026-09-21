# HC-006EB — Persistent Tight Camera Across Cells Repair

## Problem

The foundational camera was architecturally reusable but operationally local. `InspectionCameraSystem` automatically released the view whenever `interactionInspectionFocus` became unavailable, changed cell, moved outside the authored range, or changed provider.

## Ownership correction

Player choice now owns camera lifetime. Authored interactions own only temporary focus assistance.

```text
Player Y/V selection
→ InspectionCameraSystem active mode
→ player-forward fallback in ordinary traversal
→ authored focus assist near readable interactions
→ fallback resumes when focus disappears
→ explicit Y/V release
```

## Locked behavior

- Camera-relative movement remains unchanged.
- Tight camera does not create targets or activate routes.
- Interaction systems do not advance because the camera is active.
- Authored focus markers remain interaction-only.
- No cell, route, chemistry, or progression outcome changed.
