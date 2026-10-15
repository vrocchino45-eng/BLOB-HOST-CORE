# LS1D1D2C1 — Committed Silt Stabilize visual destination

Apply over the working LS1D1D2B build. Changed file only: `src/player/CoreVerbPhysicalizationSystem.js`.

When the Silt grip is `gripping` and has a finite position snapshot, the Stabilize gyroscopic field/tether use that held grain as their presentation target. Otherwise the existing legacy relationship/assist/route fallbacks remain unchanged.

No gameplay targeting, physics, Pulse contact, Absorb transaction, progression, or material ledger logic changed. In particular, this is **not** unified verb authority yet; the position is a grip snapshot, not an independently verified world transform.

Test: lock a Silt grain with A, hold Stabilize and rotate camera; visual field should stay on held grain. Release grip; legacy visual fallback should resume. Verify Guide interactions and save/export still work. Report any lag or mismatched world-space position before expanding to Pulse/Absorb.
