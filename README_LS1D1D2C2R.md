# LS1D1D2C2R — visual correction only

Apply on top of LS1D1D2C2 (or C1; the modified file is complete). Only `src/player/CoreVerbPhysicalizationSystem.js` changes.

- When A has committed a held Silt grain, its position wins over any legacy ChemObject bond for the **Absorb visual preview**. Legacy bond logic and actual absorption remain untouched.
- Pulse retains its existing sonar mechanics but reduces the outgoing wireframe's opacity for committed Silt and adds a brief contact marker at the held grain on a pulse event.
- Stabilize's accepted C1 target behavior is preserved.
- `frameState.verbVisualTargetAuthority` reports the presentation routes. It still explicitly says `gameplayAuthorityChanged: false`.

Test: hold Silt grain with A, aim camera away, press X, hold RT. Verify a brief marker at the grain and faint Absorb line from the grain to Core. Release A and confirm legacy effects. If old Guide absorption persists in gameplay, this patch does NOT fix it: that requires the separate authoritative bond/verb resolver integration.

Static JS syntax checked; no browser runtime test performed.
