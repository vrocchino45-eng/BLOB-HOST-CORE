# HC-002I — Scar-Flow Interaction Loop

## Purpose

HC-002I turns the arrived scar-flow fold into a small playable loop before any second cell is added.

The player should not simply arrive and wait for the next region. The scar-flow fold now asks the player to stabilize it through a no-combat sequence:

```text
read memory
→ align signal path
→ relieve pressure
→ respect the clot
→ prepare next branch
```

## Added

- `public/data/morph/scarFlowInteractionRecipes.json`
- `src/morph/ScarFlowInteractionSystem.js`
- scar-flow loop state in runtime/debug
- scar-flow interaction focus ring and line
- morph panel now shows scar-flow stabilization stage after morph completion
- target priority now follows the scar-flow interaction focus

## Loop Recipe

```text
SCAR_FLOW_LOOP_001 — Read, Route, Relieve
```

Stages:

1. `memory_read` — pulse `scar_memory_fleck_001`
2. `path_aligned` — pulse `resonant_path_thread_001`
3. `pressure_relieved` — ride or pulse `pressure_fold_current_001`
4. `clot_respected` — do not absorb `scar_flow_clot_001`; pulse it only after path and pressure are readable
5. `scar_flow_stable` — scar-flow fold is ready for the next branch plan

## Rule Preserved

This pass adds no gates, no doors, no teleport, no new cell, no combat, no dialogue, and no new ability.

The scar-flow cell is stabilized through chemistry and behavior, not a menu prompt.
