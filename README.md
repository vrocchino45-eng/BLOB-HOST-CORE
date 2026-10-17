# BLOB: HOST CORE — LS1D1D2O1 Free-Grain Trajectory Memory

**Changed-files overlay; NOT a standalone game. Install on top of D2N1V.**

## Intent

The player verified D2N1V's material stayed visibly wireframe-seated at the plate and could be reattached. Lock that outcome. D2O1 implements the other branch of the same foundational interaction matrix: when a Silt grain is deliberately **released without seating**, it does not snap back to the authored LS1B phase path. Its native path becomes its **North Star**, a gentle restoring influence on its own current trajectory.

## Install / changed files

Copy these files into the matching project-relative paths, overwriting where necessary:

- `src/contact/SiltTrajectoryMemory.js` **NEW:** eight-ID maximum, simple world-local release position and velocity; recent accepted held-Pulse direction can influence the free course; bounded steering/damping back toward the native path; per-unit release/travel/deviation history. No ownership or chemical authority.
- `src/routes/SiltPressureRouteSystem.js` **CHANGED:** observes held-grain motion, seeds independent history only on unseated release, integrates free-grain positions instead of overwriting them with authored positions, creates a faint visual directional wake (one visual line per existing grain), keeps plate-seated grains completely outside free trajectory. Existing targeting and release buttons unchanged.
- `src/debug/WorldObjectCensusSystem.js` **CHANGED:** recorder explicitly identifies D2O1 and exports trajectory release receipts plus current positions, velocity, deviation and release history. File name: `BLOB_LS1D1D2O1_OBSERVATION.json`.
- `docs/BLOB_INTERACTION_MATRIX_V1.md` **CHANGED:** adds a D2O1 bounded extension to the template, distinguishing native attraction from global physics and deferred cross-region motion.

## Locked systems / scope

- D2N1V: source-verified and user-confirmed visible plate seating, same-grain extraction, receiving-site occupancy, original 0.42-second visual settle.
- D2M/D2I: +0.28 directed Pulse movement while unbraced, 0.72 units/sec Absorb, 0.38–1.60 grip offset, Stabilize contact/brace pressure, default Xbox input.
- Exactly eight conserved existing units and the current `MaterialIdentityLedger` representation/owners; no newly spawned gameplay material.
- `SiltLivingMaterialCycle` unchanged, continues to govern ecological phase timing and untouched grains; withheld Core-held/plate-seated units retain their previous freeze behavior.
- Silt completion, existing safe porous packet intake, chemistry, Guide, Core locomotion, Hub/Surface, passage transitions, visual language outside this local Silt grain branch.

**This is not physics projectile travel.** It is route-local kinematic drift responding to the latest accepted manipulation, bounded by speed and acceleration, attracted to the native ecology path. No collision against geology, global area crossing, save/load persistence, off-route ticking, automatic region discovery, or phase eligibility rewrite is claimed. It should be judged visually and tactically in the browser.

## Manual field test (3–5 minutes)

1. Apply D2O1 over D2N1V; load the existing Silt testing area. Start recording with **Alt + Shift + R**. Ensure the normal porous packet wakes the original LS1B grain cycle.
2. Approach one circulating grain; **LT + A** to grip. Move and Pulse it **away from its native course** while unbraced, then **release without touching the plate** (press A or release LT). It should remain near its actual release point, carry on in a discernibly altered direction, and gradually arc back toward the Silt's native circulation. A faint muted-green trailing line indicates local free motion, not a new pickup.
3. Watch for 10–20 seconds. The grain should NOT snap back at release or at a phase transition, and other untouched grains should keep their normal paths. Try retrieving the **same grain** again with LT + A, then changing its path and releasing it a second time.
4. Separately repeat the **plate interaction**: establish actual stabilized contact, Pulse to imprint, release deliberately to seat. The original wireframe-held grain stays at the plate without a moving wake. Move away, return, and retrieve it again using LT + A.
5. Stop recording with **Alt + Shift + R** and export with **Alt + Shift + E**. Upload `BLOB_LS1D1D2O1_OBSERVATION.json`. Describe whether the grain visibly travels a new path and how gently it returns toward native motion. A short clip is optional if the motion is difficult to judge from JSON.

## Measurable acceptance

- New `silt-trajectory:released-with-trajectory` receipt refers to an actual existing grain ID after unseated release. State includes position, bounded velocity, live `nativeError`, and per-ID history.
- Initial post-release position closely matches actual previous held position, not the original authored orbit.
- **No hard teleport** when the LS1B phase changes; trajectory follows a bounded continuous course toward changing native target.
- After re-acquisition, no simultaneous free-motion authority remains for that unit. A newly released grain starts a new trajectory; history increments.
- If the grain is legitimately plate-seated, free trajectory is absent and the old D2N1V wireframe/socket remains visible until deliberately extracted.
- All eight units persist and the ownership and progression ledgers are unchanged.

## Validation / limits

143 targeted Node 22 assertions (68 new D2O1 and 75 previous D2N1V), including actual updated route method bodies, an isolated minimal Three.js construction stub, native phase jumps, drift/damping, Pulse direction, object identity, and 25s plate retention. Three changed JS files have syntax checked. The full Vite + WebGL game has **not** been rendered in this environment. Do not treat automated success as visual or long-session gameplay acceptance.

**Regression requirement:** If drift looks too strong, too weak, or difficult to reacquire, adjust the *D2O1 local steering parameters/visual presentation* after a recording. Do not compensate by changing the proven D2I control limits, D2N1V plate anchoring or canonical ecology/chemistry ownership.
