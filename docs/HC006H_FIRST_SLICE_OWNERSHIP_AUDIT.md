# HC-006H — First-Slice Ownership Audit

## True first slice

```text
Surface Wake → Guide Threshold → Hub Chamber
```

## Current runtime expression

| Blueprint role | Current runtime expression | Status | Required next ownership work |
|---|---|---|---|
| Surface Wake | `CELL_MEMBRANE_NURSERY_001` | Working interaction, compatibility architecture | Bind authored region registry, LandingMode, ObjectiveSystem, GateSystem |
| Guide Threshold | `CELL_SCAR_FLOW_FOLD_001` | Working curved traversal, compatibility architecture | Bind ThresholdMode, authored gate requirement, crossing handoff |
| Hub Chamber | `CELL_SIGNAL_CHORUS_NERVE_001` | Route-awareness proxy only | Create authored hub registry/mode/objective; preserve Chorus as local tissue behavior |

## Active owners confirmed

| Domain | Current owner | HC-006H decision |
|---|---|---|
| Physical input reading | `InputSystem` | Active |
| Physical-to-action mapping | `ControlMap` | New active canonical owner |
| Camera-relative movement | `PlayerMovementController` | Locked behavior |
| Persistent close reading | `InspectionCameraSystem` | Retain; integrate under CameraRig/Guide focus later |
| Surface interaction | `SurfaceWakeLayeredInteractionSystem` | Retain behavior; move behind true mode/registry ownership |
| Guide traversal | `GuideThresholdLayeredInteractionSystem` | Locked behavior; move behind ThresholdMode/GateSystem |
| Chorus interaction | `SignalChorusLayeredInteractionSystem` | Retain as tissue behavior, not HubMode owner |
| Grave chain | Grave route systems | Frozen result; outside next first-slice rebind scope |
| UI | HUD/debug systems | Read-only requirement retained |

## Duplicate or transitional ownership

- `resonanceHeld` duplicates `stabilizeHeld` semantically and is temporary.
- Y Guide focus currently doubles as tight-camera toggle.
- Signal Chorus currently carries both local tissue interaction and provisional Hub route-awareness presentation.
- Historical transition systems encode continuity directly instead of an authored GateRegistry/GateSystem contract.

## HC-006I allowed scope

- Add explicit first-slice region, objective, and gate registries.
- Add first-slice mode ownership or adapters.
- Bind existing working interactions beneath those owners.
- Preserve player feel, camera preference, and completed outcomes.
- Classify transitional files as active, experimental, or deprecated.

## HC-006I forbidden scope

- New Grave content
- Comb Threshold
- Aperture Fields
- New route branches
- Rewriting working camera/movement feel
- Deleting compatibility systems before their ownership is safely replaced
