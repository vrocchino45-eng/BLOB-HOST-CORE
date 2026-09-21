# HC-003E — Regression Tests

## Boot

- [ ] `npm install` completes.
- [ ] `npm run dev` starts.
- [ ] Build corner reads `HC-003E`.
- [ ] Opening scene renders.
- [ ] No console crash appears at boot.
- [ ] Player core is visible.
- [ ] Camera pocket/readability is active.

## Debug Modes

- [ ] F1 shows full debug.
- [ ] F2 shows compact debug.
- [ ] F3 hides debug.
- [ ] Controller Back/Select cycles debug mode if available.
- [ ] Gameplay remains understandable with debug hidden.

## Camera / Core Visibility

- [ ] Right stick or I/J/K/L rotates/tilts camera.
- [ ] R3 or C recenters camera.
- [ ] Player core remains visible while moving.
- [ ] Foreground tissue does not swallow the playable pocket.
- [ ] Cinematic awakening cues do not steal camera control.

## Guide Prompt Layer

- [ ] Guide prompt appears at boot or after initial movement.
- [ ] Prompt text is world-facing, not debug-only.
- [ ] Prompt helps the player find the safe seed.
- [ ] Guide does not behave like a dialogue tree or quest log.

## Seed Absorb

- [ ] Safe seed is visible quickly.
- [ ] Safe seed becomes target priority.
- [ ] Hold A/controller or F/keyboard to absorb.
- [ ] Soft bond forms.
- [ ] Absorb completes without pixel-perfect alignment.
- [ ] Player composition changes.

## Scar Warning

- [ ] Scar object reads unsafe.
- [ ] Guide warning appears or fallback prompt makes danger clear.
- [ ] Scar resists unsafe absorption.
- [ ] Pulse/observation is encouraged before force.

## First Morph

- [ ] First tissue fold arms after seed absorb and proper pulse/readiness.
- [ ] Morph progress is readable.
- [ ] Player keeps control.
- [ ] No gate, door, teleport, or chamber transition is used.
- [ ] Active cell becomes `CELL_SCAR_FLOW_FOLD_001`.

## Scar-Flow Loop

- [ ] Scar-flow arrival is readable.
- [ ] Memory/path/pressure/clot focus order remains understandable.
- [ ] Loop can reach stable/prepared state.
- [ ] Old nursery targets stop stealing focus.

## Second Morph

- [ ] Second morph readiness appears after Scar-Flow stability.
- [ ] Second no-gate morph reaches `CELL_SIGNAL_CHORUS_NERVE_001`.
- [ ] Player keeps control.
- [ ] No gate/door/teleport occurs.

## Signal Chorus Loop

- [ ] Choir node becomes focus.
- [ ] Listening pore / harmonic wave / seed-signal bridge guidance appears in order.
- [ ] Bridge warmth/tuning can complete.
- [ ] Signal Chorus reaches tuned/prepared state.

## Optional Bloom Residue Fork

- [ ] Bloom Residue Fork remains reachable after the first-minute chain.
- [ ] It is not required to judge first playable minute lock.
- [ ] If reached, Bloom loop still reaches stable/complete.

## Forbidden Regression Checks

- [ ] No gates.
- [ ] No doors.
- [ ] No teleport exits.
- [ ] No old chamber loading.
- [ ] No dialogue tree.
- [ ] No quest log.
- [ ] No combat loop.
- [ ] No fifth cell.
