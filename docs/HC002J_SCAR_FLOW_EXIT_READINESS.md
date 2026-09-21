# HC-002J — Scar-Flow Exit Readiness

## Purpose

HC-002J defines how the scar-flow fold becomes ready to morph onward without implementing that runtime morph yet.

The first morph proved:

```text
CELL_MEMBRANE_NURSERY_001
→ CELL_SCAR_FLOW_FOLD_001
```

The next planned morph is:

```text
CELL_SCAR_FLOW_FOLD_001
→ CELL_SIGNAL_CHORUS_NERVE_001
```

## Design Rule

The next transition must not be a gate, door, exit, teleport, or threshold prompt.

The scar-flow fold should become stable enough that buried signal tissue becomes readable. The cell folds into a signal-chorus nerve pocket because the player has read memory, aligned the path, relieved pressure, and respected the clot.

## Readiness Conditions

Future runtime readiness should require:

```text
scar-flow loop stage = scar_flow_stable
stability >= 0.82
path confidence >= 0.72
pressure relief >= 0.66
clot warning <= 0.42
player signal >= 0.10
player seed >= 0.28
player scar <= 0.20
```

## World-Facing Text

Before ready:

```text
The fold is still holding old pressure. Read the scar, follow the path, and do not feed the clot.
```

Ready:

```text
The scar-flow has softened. A buried choir nerve is beginning to answer.
```

Trigger:

```text
Pulse the listening thread and let the fold become signal.
```

## Forbidden Implementation

```text
No door.
No gate.
No press-E transition.
No teleporter.
No hard chamber load.
No loss of player control.
```
