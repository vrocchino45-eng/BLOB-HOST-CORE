# HC-031L — Movement + Verb Physical Grammar

Parent: **HC-031K1 Surface / Free Momentum Handoff**
Mode: **convergence / interaction physics**

## Purpose
Carry the already-authored Pulse / Absorb / Stabilize composition grammar into the Core body and surface relationship without reopening K/K1 contact or momentum tuning.

## Physical law
- **Stabilize** establishes or regulates a relationship.
- **Pulse** projects outward through that relationship.
- **Absorb** draws inward through that relationship.
- Aim/Targeting still chooses the target; verbs modify the relationship.

## Changed behavior
- Stabilize while surface-bound becomes a **brace**: ambient Host-flow reception is reduced to `0.84x` while player input remains `1.0x` and surface traction receives only a bounded `1.10x` control gain.
- Stabilize while free with a retained target becomes a **spatial hold**: ambient Host-flow reception is reduced to `0.92x`; free input acceleration and speed limits remain unchanged.
- Stabilize without a retained target does not become a universal movement brake.
- Pulse can add a maximum `0.16` bounded outward contribution only when the existing deliberate peel law has already armed/released. It cannot lower the peel threshold or detach the Core by itself.
- Absorb never gains attachment authority. Existing BondSystem inward draw remains the target-side owner.
- Existing HC029C target-side controlled push / controlled draw / tension / equilibrium multipliers are unchanged.

## Locked systems
Unchanged by hash: Targeting, Input, Camera, ChemObject, Bond, StabilizedProjection, CoreVerbPhysicalization, CoreRadialPerformance, surface truth/contact/support, Host contact ecology, and entity relationship grammar.

K/HF1/K1 locks remain unchanged: acquisition threshold, contact-gap tolerance, incompatible-surface test, deliberate peel threshold/hold, cooldown/clearance, landing carry, free-flight acceleration, drag, speed limit and boost.

## Telemetry
Schema advances to `blob.session.telemetry.v1.32`.
New event: `movement.verb_physical_grammar.changed`.
Movement samples expose physical-grammar mode, relationship source, environmental-flow multiplier, surface-traction multiplier, and Pulse peel assist.

## Validation
`npm run validate:current` passes:
- HC031L focused contract
- HC031L syntax checks
- RecipeDataSystem load
- undefined-method audit
- 14 neighboring locked-owner hashes

## Production build note
`npm run build` still cannot execute in this Linux container because the uploaded Windows `node_modules` tree lacks Rollup's Linux optional native package `@rollup/rollup-linux-x64-gnu`. This is the same environment limitation as K/K1, not a new source error.
