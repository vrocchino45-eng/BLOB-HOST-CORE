# PI06-A1 Friction and tangential response

Audit and numerical convergence only. Preserve PI03 fixed-surface and PI04/PI05 pair authority, material custody and trajectory arbitration. [Fixed surface](https://github.com/vrocchino45-eng/BLOB-HOST-CORE/blob/18491dcdd608d5e06868a7da573de106ba25647d/src/contact/SiltFreeMaterialContact.js) · [Pair ingress and solver](https://github.com/vrocchino45-eng/BLOB-HOST-CORE/blob/18491dcdd608d5e06868a7da573de106ba25647d/src/contact/SiltPairMomentum.js) · [Trajectory owner](https://github.com/vrocchino45-eng/BLOB-HOST-CORE/blob/18491dcdd608d5e06868a7da573de106ba25647d/src/contact/SiltTrajectoryMemory.js)

## Translational reference

In one declared frame, n points from A to B and v is vB−vA. Require authenticated ingress with n·v < 0 and no active persistent contact. Let w = 1/mA + 1/mB and t = v − n(n·v). Existing normal impulse **Jn = −(1+e)(n·v)/w**. The impulse magnitude that removes relative tangent slip is **Jstop = |t|/w**. The proposed reference uses **Jt = min(Jstop, μJn)** opposite t. Apply the joint impulse once atomically to both states with equal and opposite signs. Zero tangent speed yields zero tangent impulse. The stop clamp prevents reversal and suppresses division by zero. Use a separate policy for sustained sliding or static support. Instantaneously zeroing slip at impact confers no attachment.

Normal loss is **(1−e²)(n·v)²/(2w)**. Tangent loss is **Jt (|t|−½ wJt)**. Their sum equals the contact-stage kinetic loss of the two participants. Record external acceleration, drag and injections separately around contact. The models use no angular response, rolling, plasticity, adhesion, geometry mutation, energy conversion or structural state. Angular degrees of freedom or multiple contacts require a different effective mass and contact law. Existing normalized locomotion traction, fluid drag, tendril suction, on-surface compliance, and grip custody cannot stand in for the tangential coefficient.

| Axis | Proposed reference cases |
| --- | --- |
| Mass | 1:1 and 1:3 Mr. |
| Approach | `vA=(1,0.6,0.2)`, `vB=(0,0,0)` Lw/Ts, `n=(1,0,0)`. Head-on, negated pair orientation and rotated normal controls. |
| Restitution | 0, 0.5, and 1 normal response only. |
| Friction bound | μ = 0, 0.1, 0.3, 1 for the 24 analytical oblique cases. These are reference fixtures without material assignments. With the stated approach, stopping threshold is `sqrt(0.40)/(1+e)`. |
| Negative and limiting controls | Near miss, separation, no normal ingress, persistent contact, stale participant identity delegated to the existing owner, no tangential reversal, passive energy, nonfinite input, and minimum/maximum admissibility. |

## Wave 13 admission proposal

Start with the already admitted two Silt identities, physical proxy, mounts and generation constraints. Select one bounded oblique contact case and a zero-tangent baseline with matched incoming vector, approach, external forces and presentation. Keep PI04/PI05 selectors and every release, support and custody rule. Preserve existing fixed-surface exclusions and separation clock, reject unsupported joint velocity outcomes as a pair, and record both updated states plus explicit normal/tangent loss. Require retrieval of both units, eight Q, zero new impact receipts, no progression, disabled ordinary parity, and no production activation. Resolve authored coefficient, maximum speed, load regime and tolerances before any runtime change. Delete and disable nothing, and keep the reference solver in the evidence workspace.

[Reference code](PI06-reference.mjs) · [Tests](PI06-reference.test.mjs) · [Results](PI06.tap) · [Wave 11 PI05 evidence](https://github.com/vrocchino45-eng/BLOB-HOST-CORE/tree/28505e4489ec1c270722753f6a2c430eeb6b47f2/EVIDENCE/director/wave-11/v1)
