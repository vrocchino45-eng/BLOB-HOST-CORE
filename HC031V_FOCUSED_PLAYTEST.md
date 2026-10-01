# HC031V Focused Playtest

Apply directly over HC031U2.1.

## Goal
Do not test whether Gathering Ground works mechanically; U2.1 already proved that. Test whether a repeated answer is now readable as a **known but meaningful ecology response** rather than noise.

## Run
1. Use Shift+8 and reach Gathering Ground normally.
2. Complete the six first reads as in U2.1. Confirm `LIFE 6/6`.
3. Watch the HUD when answers complete. First reads should briefly show `RESP NEW ...`.
4. Release/move/revisit the Watcher after cooldown. Trigger Stabilize + Pulse, then sustain Stabilize. A repeated completion should show `RESP KNOWN W1/reverse` (later cycles rotate through `wide` and back to `tight`).
5. Repeat at a relay with Stabilize + Absorb. Known relay answers should rotate `forward -> return -> held`.
6. Watch the remote Ridge Echo and Matter Spill responses; their bead spacing/cadence and residue pulse signature should also vary across cycles.
7. Continue naturally for another 60–90 seconds rather than spamming solely for the HUD.
8. Export with Shift+T.

## Acceptance
- T/U foundation remains intact: Ridge 3/3, OBS3, REL Y, OPEN, entry, LIFE 6/6.
- `gatheringGroundEncounterRecurrences > 0`.
- `meaningfulResponseEvents > 0`.
- At least one `analysis.attempt.outcome` is `meaningful_response` during a known answer.
- Known answers do **not** increase `informationGainEvents` merely because they recurred.
- HUD response read distinguishes NEW from KNOWN and changes signature across repeated cycles.
- Semantic churn should not enter merely while understood ecology answers are actively recurring.
- No change to movement/targeting/traversal feel.

## What to report visually
A screenshot or short video is especially useful here because the pass is about whether `tight/reverse/wide`, `forward/return/held`, and cross-territory variants are perceptually different enough without watching debug text.
