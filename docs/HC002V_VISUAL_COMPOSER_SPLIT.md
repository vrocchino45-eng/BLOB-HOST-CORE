# HC-002V — VisualComposer Split Pass

HC-002V splits visual composition ownership without changing gameplay behavior.

## New composer modules

```text
src/visual/composers/EnvironmentVisualComposer.js
src/visual/composers/ChemObjectVisualComposer.js
src/visual/composers/EntityVisualComposer.js
src/visual/composers/OrbiterVisualComposer.js
```

## Ownership

- `VisualComposer.js` now acts as router/coordinator.
- Environment visuals own host/cell atmosphere and surface composition.
- Chem-object visuals own core, nutrients, scar, signal, flux, scar-flow, signal-chorus, and bloom-residue chemistry objects.
- Entity visuals own Tender and Watcher bodies.
- Orbiter visuals own Guide Folded Lantern.

## Non-goals

No new cells, no new morphs, no new recipes, no combat, no new ability scope, and no visual redesign were added.
