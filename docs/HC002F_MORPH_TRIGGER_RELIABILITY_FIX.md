# HC-002F — Morph Trigger Reliability Fix

## Why this pass exists

The HC-002E playtest screenshot showed the local cell morph panel stuck at:

```text
readiness 74% — waiting_for_composition_growth
```

The player had already absorbed the seed, and scar/signal pressure was visible, but the morph did not arm.

## Cause

The first seed nutrient previously added:

```text
Form +0.02
Seed +0.04
```

The player starts at:

```text
Form 0.32
Seed 0.36
```

So after absorption the player could land at:

```text
Form 0.34
Seed 0.40
```

HC-002E required:

```text
form > 0.34
seed > 0.39
```

That strict greater-than check made `Form 0.34` fail even though the absorb had worked.

## Fix

HC-002F changes morph readiness from brittle exact thresholds to a tolerant `compositionSettled` read.

```text
Form >= 0.335
Seed >= 0.395
Seed absorbed can also satisfy seed growth
```

The seed nutrient was also tuned slightly:

```text
Form +0.03
Seed +0.05
```

## Expected Result

After absorbing the seed:

```text
readiness should move from 74% to 86% or 100%
```

If the player is already near scar or signal, the panel should show:

```text
morph armed — pulse scar or signal
```

Then pressing `Space` or controller `X` should start the no-gate morph.

## Scope

No new regions, entities, orbiters, abilities, gates, doors, or combat were added.
