# HC-007C — Hub Investigation Gameplay Fill

## Mode
First-slice gameplay convergence.

## Purpose
Preserve the existing Hub Status Page and Grave Memory gate triggers while making the junction itself into a compact investigation space.

## Player loop

```text
arrive at central junction
→ physically visit Grave Memory, Vascular Rhythm, and Silt Pressure
→ pulse each gate at close range
→ feel and see three distinct chemistry responses
→ pulse the first memory fragment
→ return to the center with all four readings
→ existing Status Page self-reading becomes meaningful
→ existing Grave Memory gate becomes crossable
```

## Trigger policy
- `HubInvestigationGameplaySystem` never completes the Hub objective.
- The Status Page remains the self-reading completion trigger.
- `GateSystem` remains the route-availability owner.
- `ThirdLocalCellMorphSystem` remains the Grave Memory transition adapter.
- Vascular Rhythm and Silt Pressure remain visible but dormant.

## Visual and feel target
- Grave Memory answers with an inward, lower-pressure echo.
- Vascular Rhythm answers with a sleeping pressure beat.
- Silt Pressure answers with dense viscosity and recoil.
- Read route markers remain lit so the player can remember what has been investigated.
- The center only becomes emphatic once all route and memory readings exist.

## Acceptance tests
- Opening the Status Page early may display information but cannot satisfy the first Hub self-reading.
- Each route requires physical approach and a close-range X Pulse.
- The memory fragment requires a close-range X Pulse.
- Investigation only converges after returning to the junction center.
- Convergence does not directly complete ObjectiveSystem or open a route.
- Opening the Status Page after convergence retains the established objective/gate behavior.
