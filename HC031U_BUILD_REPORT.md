# HC031U — Gathering Ground Alive Pass 1

Parent: HC031T6 — Adjacent Territory Runtime Mount Lock  
Version: 0.31.48  
Telemetry: blob.session.telemetry.v1.47

## Mode
Vertical ecology convergence. HC031T6 traversal is accepted and frozen; this pass deepens the now-local Gathering Ground instead of adding another destination.

## Purpose
Make Gathering Ground read as a living Host territory after entry. The first proof is 3 encounter families x 2 encounters, all optional and all inside the same Aperture cell.

## Added
- Canonical-anchor Gathering Ground population: one perimeter Watcher and two exchange relays.
- Ambient encounters: Watcher sweep; relay matter exchange.
- Reactive encounters: Stabilize+Pulse Watcher stable interrogation; Stabilize+Absorb relay held intake.
- Cross-territory encounters: Watcher answer returns to Membrane Ridge; relay surplus matter spills back toward Ridge and leaves a faint residue.
- LIFE debug readout: total plus A/R/X family completion.
- Encounter telemetry: discovered, started, completed, ignored, interrupted.
- OBS3 telemetry dedupe: redundant Pulses still visibly answer but no longer create false new observation events.

## Ownership locks
EntitySystem remains the only organism movement/body behavior owner. Existing EntityRelationshipGrammar interprets chords. GatheringGroundAliveSystem owns only encounter staging, low-cost local Host-matter presentation, and cross-territory visual replies.

No progression, targeting, movement, collision, chemistry, cell, route, or save authority is added.

Hash-locked from HC031T6:
- PlayerMovementController
- MembraneRidgeGameplaySystem
- ApertureFieldsArrivalSystem
- TargetingSystem
- SignalPlainEcologySystem
- InputSystem
- SiltPressureRouteSystem
- VascularRhythmRouteSystem

## Validation
PASS:
- `npm run validate:hc031u`
- `npm run smoke:hc031u` — deterministic 6/6 encounter completion
- `npm run validate:hc031t5-smoke` — 30/60/120/144 FPS Ridge trace
- `npm run audit:undefined-methods`
- `npm run validate:recipe-data`
- syntax checks for changed runtime owners

Production `npm run build` is not validated in this Linux workspace because the recovered Windows node_modules lacks `@rollup/rollup-linux-x64-gnu`. No dependency changes were made and node_modules is excluded from the delta.

## Acceptance target
Human entry remains HC031T6-correct: Ridge 3/3 -> OPEN -> same-cell physical entry. Inside Gathering Ground, the player can witness 2 ambient encounters, produce 2 chord-driven organism responses, and see 2 consequences propagate back toward Ridge. No encounter is a progression gate.
