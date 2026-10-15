# LS1D1D2E observation capture — changed-files patch

Apply over the LS1D1D2C2R working baseline. This replaces only `src/debug/WorldObjectCensusSystem.js`. It does not apply the untested authority guard.

## Capture

- Alt+Shift+R: start/stop a capture. This samples selected Silt and legacy targeting fields every 150 ms, storing only changes.
- Alt+Shift+E: download a JSON timeline and the current F5 census snapshot.
- Existing F4 census overlay and F5 export remain unchanged.

Run one capture for normal entry, another for Shift+6. During each, lock a grain, rotate away, Pulse, Absorb, release, and interact with ecology/traversal objects. Export both captures. The tool can detect target state changes and keyboard inputs but **cannot establish** gamepad buttons, authoritative force, chemistry transactions, orb source, or traversal cause. Those need dedicated event hooks in the owning systems before we claim functional bot coverage.

No new dependencies. No gameplay mechanics changed. Syntax checked with `node --check`.
