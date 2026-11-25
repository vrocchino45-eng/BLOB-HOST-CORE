# NF02-C1 · Dimensional and scale contract · draft revision 1

This contract is proposed for approval. It preserves existing runtime interpretation. BLOB can admit classical, structural, molecular, biological, large-scale, explicit world-specific and bounded quantum-inspired laws through separately named domains. Only force-free classical translation and an instantaneous inelastic pair contact are in the first verification scope.

## Unit namespaces

| Namespace | Base quantities | Use |
| --- | --- | --- |
| Runtime physical | `Lw` per authored world unit, `Ts` per admitted simulation second, `Mr` per explicitly authored inertial reference mass | Geometry and conventional mechanics on a stated domain. No meter or kilogram conversion has been assigned. |
| Accounting | `Q` inventory unit | Custody, identifying grain composition and conservation. `Q` has no conversion to `Mr`. |
| Gameplay indices | Owner-qualified labels with ranges and basis | e.g. Shelf `pressure01`, regional `viscosity`, reserve and compatibility. Retain source-owned semantics and reference values. |
| Presentation | Pixels, render scales, radian angles, color/alpha, audio gains and render-clock times | Report separately from physical state and dynamic condition. |
| Fictional | Named law, local dimensional signature, compatible reference quantities and explicit mapping if one is later approved | Never implicitly mix with SI or mechanical scales. |

`v=Lw/Ts`; `a=Lw/Ts²`; `p,J=Mr·Lw/Ts`; `F=Mr·Lw/Ts²`; `E=Mr·Lw²/Ts²`; `P=Mr·Lw²/Ts³`; `ρ=Mr/Lw³`; pressure or stress `Mr/(Lw·Ts²)`. Angle is dimensionless in rad, angular rate is rad/Ts, angular momentum (Mr·Lw²/Ts). Torque and energy have the same dimensions and different semantic kinds. Friction and restitution are dimensionless with a scoped model. Damping coefficient in Ts⁻¹, frequency in cycles/Ts. Physical dynamic viscosity `Mr/(Lw·Ts)` requires a calibrated continuum law. Flow pressure/current and resistance indices remain separate from hydraulic/electrical units.

## Conversion rule

An admitted scope may declare `sL` meters per Lw, `sM` kg per Mr and `sT` seconds per Ts. For a dimension vector ((l,m,t)), multiply by `sL^l · sM^m · sT^t` from runtime to SI. Divide for the reverse. Each required scale must be finite, positive and explicitly named by provenance. `sT=1` only describes an admitted simulation second versus SI seconds in an admitted mechanical model. It does not equate simulated elapsed with wall elapsed after drops or imply physical seconds for a fictional biological rate. `sL` and `sM` are intentionally unset. Values in SI-oriented MP02 fields such as `inertialMassKg`, `densityKgM3` and `permeabilityM2` remain unset until their conversion and source are approved. `contactRadiusWorldUnits` is already in Lw. A per-experiment manifest may use Mr and Lw in separate approved runtime metadata without populating SI fields.

Example of dimensional verification only. If a separate hypothetical model chose `sL=0.2`, `sM=0.5` and `sT=1`, a unit impulse would equal 0.1 kg·m/s and a unit density would equal 62.5 kg/m³. These example factors confer no scale on BLOB.

## Coordinates, precision, and effective rates

Retain named frames (Core-local, Silt-local, world, camera/view and clip). For positions use translation and rotation, applying scale only when authored as physical. Rotate normals by the correct inverse transpose if scale is nonuniform. Vectors omit translation. Both colliders and velocity must share a fixed inertial frame over the same step. A moving parent requires explicit relative velocity or rejection. Never compare render-scale changes or a camera dolly with physical growth. An initial two-sphere fixture should require a rigid route-local frame and forbid nonuniform scaling or ambiguous fixed-surface ties.

Ingress uses relative coordinates to reduce cancellation. Reject nonfinite values, nonpositive inferred mass/radius and degenerate normals. Validate IDs and monotonic epochs before calculating an impulse. For the analytical fixtures require `|x−y| ≤ 1e-12 + 1e-12·max(|x|, |y|)` in the stated units. Geometry uses a relative squared-scale tolerance; near-tangent ambiguous entries reject. Future authored runtime contact needs independent length and time tolerances calibrated against quantization, scene scale, closure rate and microstep limits. Keep PI03 epsilon and max speed untouched. Discrete comparison tracks accepted displacement, dropped time, motion substeps and actual impact time separately.

Effective solver resolution is event-sensitive. Existing 0.025 s microsteps at 2.1 Lw/s can travel 0.0525 Lw before considering relative motion, and opposite grains could close by 0.105 Lw in one such interval. Treat swept time-of-impact as necessary even if an experimental collider has a 0.12 Lw diameter. At much smaller scales measure relative gap and step travel, and prefer local coordinates and adaptive or analytical handling before changing global timing. No alternative time rates or second physics owner are admitted here.

[Machine-readable contract](NF02-contract.json) · [Reference proposals](NF03-reference-proposal.md)
