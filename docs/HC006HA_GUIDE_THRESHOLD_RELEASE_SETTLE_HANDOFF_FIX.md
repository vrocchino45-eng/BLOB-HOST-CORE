# HC-006HA — Guide Threshold Release-Settle Handoff Fix

## Mode

Focused convergence repair.

## Observed live failure

The player reached the final Guide Threshold stage with:

- path progress at 1.00
- traversal and resonance requirements complete
- response complete
- LT released
- settle progress near 0.79
- overall progress near 0.96
- endpoint distance near 2.84

The interaction remained active and could not finish.

## Cause

`GuideThresholdLayeredInteractionSystem` used this final condition every frame:

```text
LT released AND raw distance to one endpoint <= settleRange
```

The Scar-Flow environment continues applying ambient movement. A player could validly enter the settling ribs and begin the final settle, then drift outside the endpoint sphere before the settle duration finished.

The system did not remember that the release had already been accepted.

## Ownership repair

HC-006HA adds a durable release handoff:

1. Determine whether the player is inside either the direct endpoint range or the authored late-path rib corridor.
2. Accept and latch the first valid LT release.
3. Store the release position and source zone.
4. Continue settling while LT remains released.
5. Pause, rather than reset, if LT is held again.
6. Complete the existing Guide Threshold handoff at 100%.

## Authored data additions

```text
settlePathProgressMin: 0.82
settleCorridorRange: 1.68
```

These make the visible rib structure—not only one mathematical endpoint—the valid release area.

## New diagnostics

```text
settleLatched
settleZoneReady
settleZoneSource
settleAnchorDistance
```

Expected action during the final stage is now reported as:

```text
release_stabilize
```

## Allowed scope

- Final Guide Threshold release ownership
- Settling-rib zone evaluation
- Release latching
- Canonical expected-action readout
- Regression coverage for ambient drift

## Forbidden scope

- Guide traversal redesign
- New route or region
- Hub Chamber implementation
- Surface Wake changes
- Signal Chorus changes
- Grave changes
- Camera changes
- Completion before a valid release zone

## Acceptance result

Automated simulation proves:

- release outside the zone does not latch
- holding LT inside the zone does not latch
- releasing LT inside the zone latches
- ambient drift after the latch cannot strand progress
- re-holding LT pauses the settle
- final completion still hands to the existing second morph
