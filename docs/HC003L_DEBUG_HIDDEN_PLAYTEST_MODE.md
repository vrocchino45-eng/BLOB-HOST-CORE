# HC-003L — Debug-Hidden Playtest Mode

## Purpose

HC-003L makes the first playable minute testable without the left/right development panels.

The player-facing layer should now be:

```text
Guide Prompt
+ small Playtest HUD
+ tiny Tissue Shift no-gate status strip
+ target reticle / player-core readability cues
```

The debug panels still exist, but they are no longer required to understand the opening.

## Required first playable minute

```text
CELL_MEMBRANE_NURSERY_001
→ CELL_SCAR_FLOW_FOLD_001
→ CELL_SIGNAL_CHORUS_NERVE_001
```

## Optional beyond-minute fork

```text
CELL_BLOOM_RESIDUE_FORK_001
```

## Debug behavior

Default:

```text
Debug hidden
Playtest HUD visible
Guide prompt visible
Tissue Shift strip visible
```

Controls remain:

```text
F1 = full debug
F2 = compact debug
F3 = hide debug
Controller Back/Select = cycle debug
```

## No expansion rule

HC-003L does not add cells, morphs, gates, route runtime, dialogue trees, quest logs, combat, doors, teleports, or old chamber runtime.
