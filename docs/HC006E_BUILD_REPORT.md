# HC-006E Build Report

## Mode
Opening retrofit + interaction convergence.

## Purpose
Introduce the reusable BLOB interaction grammar and optional inspection camera in Surface Wake before the first safe-seed absorb.

## Implemented

- Added `SURFACE_WAKE_LAYERED_INTERACTION_HC006E` authored recipe.
- Added `SurfaceWakeLayeredInteractionSystem`.
- Published the generic `interactionInspectionFocus` contract from Surface Wake.
- Mapped the opening sequence to `LayeredInteractionGrammar`.
- Rebound contextual A to pulse-read, held resonance, then normal absorb.
- Suppressed generic safe-seed targeting until completion.
- Prevented BondSystem fallback absorption while the listening fold owns context.
- Rebound opening pacing, Guide prompts, HUD, and F1 diagnostics.
- Preserved camera-relative movement and HC-006D inspection architecture.

## Resulting sequence

```text
approach listening fold
→ pulse-read once
→ hold resonance
→ visible membrane response
→ release
→ settle
→ safe seed readable
```

## No-scope changes

- No route activation.
- No cell change.
- No gate, door, teleport, branch menu, or combat.
- No Guide Threshold retrofit.
- No Signal Chorus or Grave outcome changes.

## Validation result

- HC-006E focused validator passed.
- Full current regression suite passed.
- RecipeData load validation passed.
- Undefined-method audit passed.
- Production build passed.
