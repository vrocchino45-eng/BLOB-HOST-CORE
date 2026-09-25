# HC-031K1 — Surface / Free Momentum Handoff

Parent: **HC-031K-HF1 Contact Lock Closure**
Mode: **convergence / movement physics**

## Purpose
Keep the K/HF1 contact grammar locked while making landing and peel feel like continuous physical motion rather than a locomotion-mode switch.

## Changed behavior
- Free → surface captures the incoming velocity and removes only the surface-normal impact component.
- Existing tangential motion receives a short **0.38 s landing-carry window** with reduced transitional drag.
- After capture, the previous suctioned-rest damping returns automatically.
- Missing-forward-anchor hesitation is softened only during the same landing-carry window.
- Surface → free explicitly preserves the current surface-tangent velocity and adds an outward peel component derived from adhesion + actual release tension.
- Surface identity transfer, contact-gap tolerance, deliberate peel thresholds, cooldown, clearance, free-flight acceleration, speed limit, boost, camera, targeting, verbs, ecology, routes, and progression are unchanged.

## Telemetry
Schema advances to `blob.session.telemetry.v1.31`. Attachment events and movement samples now expose landing entry/tangent speed, carry age/weight, release inherited tangent speed, release normal impulse, and momentum handoff mode.

## Validation
Run `npm run validate:current`.

## Production build note
`npm run build` cannot execute in this Linux container because the uploaded Windows `node_modules` tree does not include Rollup's Linux optional native package `@rollup/rollup-linux-x64-gnu`. Scoped validation, recipe loading, undefined-method audit, and JS syntax checks pass.
