# HC-001N — Regression Test Checklist

Use this checklist before moving beyond the first membrane nursery pocket.

## Boot

- [ ] `npm install` completes.
- [ ] `npm run dev` starts Vite.
- [ ] Build overlay shows `BLOB HC-001N`.
- [ ] Manifest shows `HC-001N`.
- [ ] Lock status shows `lock_candidate_pending_user_playtest`.
- [ ] No missing JSON recipe errors.
- [ ] No missing placeholder replacement errors.

## Recipe Counts

Expected minimum counts:

```text
Hosts: 1
Local Cells: 1
Chem Objects: 4
Bond Recipes: 3
Function Recipes: 2
Entity Recipes: 2
Orbiter Recipes: 1
Visual Recipes: 11+
Placeholders: 8+
```

## Movement

### Keyboard

- [ ] WASD / Arrows move the player.
- [ ] Q/E move vertically.
- [ ] Shift gives stronger push.
- [ ] Movement feels soft/viscous, not rigid.

### Controller

- [ ] Browser detects controller.
- [ ] Left stick moves.
- [ ] RT rises.
- [ ] LT descends.
- [ ] B or L3 gives stronger push.

## Targeting

- [ ] Reticle appears around target.
- [ ] Seed nutrient is prioritized before absorption.
- [ ] Pointer line is visible enough to read.
- [ ] Debug shows target ID, lock, distance, and hint.

## Absorb

- [ ] Hold F or A near seed.
- [ ] Player pulls toward seed.
- [ ] Soft bond forms.
- [ ] Absorb progress increases.
- [ ] Seed disappears at absorb completion.
- [ ] Player `Seed` composition increases.
- [ ] Player `Form` composition increases.

## Scar Resistance

- [ ] Move near scar plate.
- [ ] Attempt absorb.
- [ ] Scar does not behave like a pickup.
- [ ] Debug says unsafe/resists absorb.
- [ ] Scar interaction may raise scar risk slightly.
- [ ] Tender reacts defensively near unsafe scar interaction.

## Pulse

- [ ] Space / X triggers pulse.
- [ ] Seed opens/brightens.
- [ ] Scar echoes/flickers.
- [ ] Signal thread answers.
- [ ] Tender opens fronds.
- [ ] Watcher answers or warns.
- [ ] Guide answers with smaller wave.

## Entities

### Tender

- [ ] Tender is visible.
- [ ] Tender does not read as generic sphere/oval.
- [ ] Tender has fronds / caretaker silhouette.
- [ ] Tender reacts to pulse.
- [ ] Tender has debug state.

### Watcher

- [ ] Watcher is visible.
- [ ] Watcher does not read as pickup.
- [ ] Watcher has sensing bulbs / sensor silhouette.
- [ ] Watcher tracks player.
- [ ] Watcher has debug state.

## Guide Orbiter

- [ ] Guide is visible.
- [ ] Guide reads as folded lantern-like object.
- [ ] Guide points toward seed before absorption.
- [ ] Guide shimmer line is visible.
- [ ] Guide dims/folds near scar interaction.
- [ ] Guide has debug state.

## Visual Composition

- [ ] Player core reads as protected seed.
- [ ] Seed nutrient reads as protected pod.
- [ ] Scar reads as hardened wound.
- [ ] Signal reads as communication thread.
- [ ] Flux ribbon reads as movement/current.
- [ ] Membrane pocket reads as living tissue.
- [ ] Distant host gives macro scale.
- [ ] Motion signatures are active in debug.

## Forbidden Regression Checks

- [ ] No hard gates.
- [ ] No chamber transition code.
- [ ] No old HUD tab sprawl.
- [ ] No region jumping.
- [ ] No new combat loop.
- [ ] No new abilities outside `move`, `pulse`, `absorb`.
