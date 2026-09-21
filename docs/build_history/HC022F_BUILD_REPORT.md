# HC022F — Visible Host Rhythm Foundation

One authoritative 5.8-second Host cycle now exists: gather -> swell -> release -> recover.
It is deliberately visible while the player stands still. The existing 66-mote field compresses/releases, changes visual weight, and rides the same phase. No HUD rhythm meter is added.

This is the foundation only. Timing gives no mechanical bonus yet. Later tissue/region systems can sample this same signal rather than inventing independent clocks.

Performance: no new particles, geometry, raycasts or draw calls. The rhythm system owns no scene object; the existing ambient Points field samples a few scalar values.

Design rule: macro Host cause must produce micro environmental experience; the world is the metronome.
