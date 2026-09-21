# HC-006I — First-Slice Runtime Ownership Rebind

## Mode

Architecture convergence.

## Purpose

Bind the proven runtime to the true HOST CORE rule:

```text
Modes own scene behavior.
Systems own reusable gameplay.
Registries own authored content.
UI displays state only.
```

## Authored first-slice path

```text
surface_wake -> guide_threshold -> hub_chamber
```

## Runtime mapping

| Blueprint region | Current runtime cell | Mode | Status |
|---|---|---|---|
| Surface Wake | `CELL_MEMBRANE_NURSERY_001` | `LandingMode` | active |
| Guide Threshold | `CELL_SCAR_FLOW_FOLD_001` | `ThresholdMode` | active |
| Hub Chamber | `CELL_SIGNAL_CHORUS_NERVE_001` | `HubMode` | route-awareness proxy |

## Registries

- `RegionRegistry`: identity and first-slice region mapping
- `ObjectiveRegistry`: authored objective definitions
- `GateRegistry`: living threshold definitions
- `CameraProfileRegistry`: region camera intent
- `VisualLanguageRegistry`: region-readable material language

## Systems

- `ModeController`: publishes current scene-behavior owner
- `ObjectiveSystem`: translates proven runtime progress into authored objective truth
- `GateSystem`: records living threshold availability and crossing state

## Compatibility boundary

The existing morph systems remain transition adapters in this pass. Replacing them while the first slice is being stabilized would violate one-bug/one-scope and working-chambers-are-locked rules.

## Hub limitation

Signal Chorus supplies central route-awareness behavior and therefore runs under `HubMode`, but the full Hub Chamber still requires:

- central junction layout
- three visible gates
- one active route
- dormant route identities
- first memory fragment
- first status-page use

The Hub objective can report `proxy_complete_full_hub_pending`; it may not report full completion.
