# HC-029A Focused Playtest — Relationship Targeting & Intentional Focus

## Goal

Determine whether targeting now feels like **choosing and maintaining a relationship** rather than an auto-aim system continuously changing its mind.

## Primary test — Scar Flow Fold

This is the most important test because the HC028R telemetry showed rapid ping-pong between `resonant_path_thread_001` and `scar_memory_fleck_001`.

1. Enter Scar Flow Fold and frame both objects near one another.
2. Move the camera slowly between them **without pressing P/A/S**.
   - Soft candidate changes are allowed.
   - There should be no strong lock reticle or camera snap.
3. Aim generally at the path thread and begin Pulse, Absorb, or Stabilize.
   - That object should become the retained relationship.
4. Let the other object pass closer / become slightly more favorable while keeping the current target roughly in view.
   - The relationship should **not** jump.
5. Deliberately turn the camera clearly away from the current relationship and onto the other object while still holding a continuous verb.
   - A handoff should occur only once the redirect is unmistakable.
6. Release the verbs.
   - The relationship should settle out without a one-frame flicker, then return to soft candidate behavior.

## Symbol grammar read

- **Pulse:** look for a small outward triangle along the Core→target relationship axis.
- **Absorb:** look for the inverse/inward triangle.
- **Pulse + Absorb:** both opposed triangles may coexist as a composed exchange read.
- **Stabilize:** target should gain a coherence boundary rather than the old generic lock ring. More authored instability should produce more asymmetry/vibration.
- **Stabilize + another verb:** the coherence boundary should coexist with the directional triangle rather than replacing it.

These glyphs should feel like the physics are explaining themselves, not like HUD icons floating over pickups.

## Control checks

- Y/Focus should still behave as inspection/focus ownership and must not become a fourth manipulation verb.
- No new target-cycle button exists.
- Camera should never snap toward the selected relationship.
- Movement remains camera-relative and unchanged.

## Regression sweep

Run the normal route chain through Hub, Vascular, Silt, Comb and Aperture as available. Confirm:

- Hub deliberate route commits still work.
- Comb re-entry/return arming still works.
- HC028R ecology distribution remains present.
- Tender/Watcher/Relay behavior is unchanged.
- Absorb bond behavior still follows the retained relationship while Absorb is held.
- No startup `recipe is not defined` regression.

## Telemetry check

Export telemetry immediately after the recording.

For this pass:

- `attention.candidate.changed` = soft attention movement and is **not** semantic target-switch effort.
- `attention.target.changed` = actual retained relationship acquire/handoff/release.
- In the Scar Flow Fold test, there should be dramatically fewer relationship target switches than the HC028R reference run even if candidate changes still occur.

## Calibration questions

1. Is relationship retention too sticky?
2. Is deliberate handoff too easy?
3. Before pressing a verb, can you reasonably predict which candidate will be adopted?
4. Are the triangles too UI-like, too small, or too visually loud?
5. Does Stabilize's coherence boundary communicate instability better than the old generic sphere/ring language?
