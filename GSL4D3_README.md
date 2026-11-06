# BLOB GSL-4D3 — Expression Grammar Correction

## Purpose
Isolated 24-trial still-frame recognition comparison: GSL-4D1 approximate reference vs revised GSL-4D3 silhouette grammar. Three time samples each for idle, curiosity, support, concern, per visual style.

## Test
Open `GSL4D3_RECOGNITION_LAB.html` in a browser. Click **Start 24-trial blind test**, answer the four choices, click **Next trial** after each answer, then **Export one JSON** and upload `GSL4D3_RECOGNITION.json`.

## New grammar
- Idle: small, symmetrical orb and fine closed orbit.
- Curiosity: directional asymmetric pointed reach.
- Support: rounded core with broad protective paired arcs.
- Concern: compressed angular serrated perimeter.

## Scope / locks
Standalone HTML only; no project runtime changes. GSL-4C motion parameters, LS1 locomotion, Core physics, GSL-1 cue timing, and HC027D1 audio baseline unchanged. No code deletion targets.

## Acceptance
All 24 trials complete; one combined JSON exported; GSL-4D3 recognition beats reference, especially idle/curiosity/concern. This is exploratory, not statistical proof. Review confusion matrix before any live-game promotion.

## Caveat
GSL-4D1 reference is a simplified approximation rather than pixel-exact reuse. The lab deliberately emphasizes geometric distinction and does not claim dynamic readability or runtime integration.
