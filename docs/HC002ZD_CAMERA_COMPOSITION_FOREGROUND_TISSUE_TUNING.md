# HC-002ZD — Camera Composition + Foreground Tissue Scale Tuning

## Purpose

HC-002ZD is a focused readability pass after HC-002ZC fixed the camera crash. The four-cell chain works, but the camera could still be swallowed by large translucent tissue shells, especially after reaching Bloom Residue Fork.

## Fix Scope

- Reduce dominance of old source-cell shells after Bloom Residue arrival.
- Strengthen foreground tissue fade when the object is between camera and player.
- Add a clearer play-pocket camera state.
- Pull the camera higher/back when source-cell tissue fills the camera-player sightline.
- Keep right-stick / IJKL orbit and R3 / C recenter.
- Preserve player-core halo and glint.

## Runtime Changes

### CameraReadabilitySystem

- Tracks active surface vs source-cell surface.
- Applies stronger fade to source-cell surfaces.
- Uses a lower opacity floor for inactive/source tissue shells.
- Adds `playPocketWindow`, `sourceSurfaceIntensity`, and `pocketLift` to camera readability state.
- Increases auto-pullback when old source tissue is still crossing the sightline.

### GameRuntime Camera

- Slightly increases default camera distance and pitch.
- Uses camera readability state to lift and pull back the camera when the play pocket is crowded.
- Preserves manual orbit/recenter controls.

### Bloom Residue Arrival

- Suppresses Nursery, Scar-Flow, and Signal-Chorus environment shells to near-invisible memory traces after Bloom Residue arrival.
- Keeps Bloom Residue environment active but less visually dominant.

## Acceptance Tests

- [ ] Starting Membrane Nursery renders normally.
- [ ] Safe seed is visible and targetable.
- [ ] Right stick / IJKL camera orbit still works.
- [ ] R3 / C recenter still works.
- [ ] Four-cell chain can reach Bloom Residue Fork.
- [ ] Bloom Residue stable state remains visible.
- [ ] Large old source shells no longer dominate the screen after Bloom arrival.
- [ ] Player core remains readable with halo/glint.
- [ ] No camera console crash occurs.

## Forbidden Scope

- No new cells.
- No new morph destination.
- No new abilities.
- No combat.
- No dialogue system.
- No HC-003 runtime expansion.
