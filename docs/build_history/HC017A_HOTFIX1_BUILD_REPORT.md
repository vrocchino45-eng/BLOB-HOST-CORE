# HC017A HOTFIX1 — Core Verb Player Root Wiring

## Failure reproduced
Browser runtime stopped in `CoreVerbPhysicalizationSystem.updateStabilize()` while reading
`this.playerRoot.position`.

## Root cause
HC017A instantiated `CoreVerbPhysicalizationSystem` with `playerRoot: this.playerRoot`.
`GameRuntime`'s established player object is `this.playerCore`; the neighboring Core systems
already use that authority.

This left `CoreVerbPhysicalizationSystem.playerRoot` undefined. Stabilize was simply the first
new HC017A path to dereference `.position`, so the frame loop stopped immediately.

## Fix
Changed only the HC017A constructor wiring:

`playerRoot: this.playerRoot` → `playerRoot: this.playerCore`

No movement, chemistry, route, interaction, Pulse, Absorb, Stabilize, progression, scale,
camera, or spatial tuning was changed.

## Regression intent
HC017A remains presentation-only. This hotfix restores the established Core root reference
rather than adding a fallback or masking the exception.
