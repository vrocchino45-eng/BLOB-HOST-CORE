# HC-006KB — Status Page Completion Commit

## Mode
Convergence repair.

## Purpose
Commit the first Hub self-reading on the Status Page open event and ensure the open Status Page presents the resulting objective/gate state from the same runtime tick.

## Root cause
`StatusPageSystem` runs early so it can suppress gameplay input. In HC-006KA it also rendered immediately. `ObjectiveSystem`, `GateSystem`, and Hub presentation update later in the registry order, so the first rendered Region tab could show the previous 80% objective even though the open event had occurred.

## Repair
1. The first Hub use commits on the Status Page open event itself.
2. Hub context can be recognized from `HubMode` or the Hub runtime cell.
3. Status presentation rendering is deferred to a microtask after the runtime update stack.
4. Objective and Gate systems therefore consume the commit before the open Region tab renders.
5. F1 exposes commit event, frame, and mode.

## Ownership
- `StatusPageSystem`: owns page interaction and `firstHubUseComplete` interaction fact.
- `ObjectiveSystem`: owns Hub objective completion.
- `GateSystem`: owns Grave Memory crossability.
- `HubChamberFoundationSystem`: owns Hub route presentation.
- Status Page remains read-only for chemistry/world state.
