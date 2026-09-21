# HC-004QA — Signal Chorus Runtime Handoff Audit Fix

## Audit finding

The blocker was reproduced in a runtime simulation using the actual `SignalChorusArrivalSystem` and `SignalChorusInteractionSystem`.

Before this fix, one choir pulse produced:

```text
arrival chorusResponse: 0.24
arrival listeningTrust: below 0.32
arrival readyForSignalLoop: false
interaction active: false
interaction focus: none
```

The interaction loop therefore could not process the first pulse even though the HUD instructed the player that one pulse would advance focus.

A second independent issue was duplicate ownership: arrival, interaction, targeting, and the Guide orbiter could point to different Signal Chorus objects during the same sequence.

## Fix

- Interaction activates from `signalChorusArrival.active`, not hidden arrival metric thresholds.
- Arrival hands focus ownership to interaction after the loop activates.
- Targeting removes the arrival-focus provider for Signal Chorus.
- Guide orbiter follows the interaction focus while active.
- Guide prompt update order moves after Signal Chorus gameplay/targeting updates.
- Third morph readiness is latched and requires a fresh later pulse.
- Runtime identity is corrected to HC-004QA.
- A dynamic runtime validator executes the actual sequence.

## Acceptance sequence

```text
choir pulse -> pore
pore pulse -> harmonic wave
harmonic pulse -> seed bridge
bridge pulse -> tuned, no morph yet
fresh bridge pulse -> existing Bloom morph may start
```

## Forbidden scope preserved

No gates, doors, teleports, old exit registries, branch menus, combat, dialogue trees, quest logs, new route branches, or new morph destinations were added.
