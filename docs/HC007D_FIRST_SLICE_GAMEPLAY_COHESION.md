# HC-007D — First-Slice Gameplay Cohesion

## Design intent

The first three spaces already contain systemic play and proven convergence triggers. This pass connects them by allowing the core to retain evidence of how the player moved through those systems. The result is continuity, not a new progression track.

## Runtime ownership

`FirstSliceCohesionSystem` reads published state from Surface Wake, Guide Threshold, Hub investigation, input, and chemistry. It owns only:

- historical maxima and retained regional lesson scores
- soft reading, binding, and stabilizing practice axes
- additive visual marks attached to the existing player core
- `frameState.firstSliceCohesion`

It explicitly does not own triggers, objectives, gates, route states, chemistry mutation, ability unlocks, or player relocation.

## Player-facing result

Three faint rings gather around the core as regional lessons become legible. Three small orbiting marks respond to practiced reading, binding, and stabilizing. The Status Page reports the leading tendency as an emerging practice, not a class or commitment.

## Acceptance boundary

The pass succeeds only if the first slice feels cumulative while the HC-007A, HC-007B, and HC-007C trigger sequence remains behaviorally identical.
