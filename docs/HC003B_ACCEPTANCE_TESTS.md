# HC-003B — Acceptance Tests

## Boot

- [ ] `npm install` completes.
- [ ] `npm run dev` starts.
- [ ] Build identifies as `HC-003B`.
- [ ] No console crashes on boot.
- [ ] Starting Membrane Nursery renders normally.
- [ ] Camera controls from HC-002ZD still work.

## Guide Prompt Panel

- [ ] Guide prompt panel appears above the tissue-shift panel.
- [ ] It remains visible when debug panels are hidden.
- [ ] It does not require a dialogue tree.
- [ ] It does not create a quest log.
- [ ] It has a debug fallback in full debug mode.

## Opening Prompts

- [ ] Starting in Membrane Nursery gives an awakening/safe seed prompt.
- [ ] Targeting the safe seed gives a safe-seed prompt.
- [ ] Targeting scar gives a caution prompt.
- [ ] First morph readiness gives a tissue-fold prompt.

## Scar-Flow Prompts

- [ ] Arrival in Scar-Flow gives a flow/scar interpretation prompt.
- [ ] Scar memory focus prompts the player to pulse/read.
- [ ] Scar clot focus warns the player not to treat it as food.

## Signal Chorus Prompts

- [ ] Signal Chorus arrival tells the player the host is answering.
- [ ] Choir node focus gives a listen/pulse prompt.
- [ ] Seed-signal bridge focus gives a relation/warmth prompt.

## Beyond-Minute Fork

- [ ] Bloom Residue Fork remains reachable.
- [ ] Bloom afterfork prompt does not pretend it is required for the first minute.

## Regression

- [ ] First morph still works.
- [ ] Scar-Flow loop still works.
- [ ] Second morph still works.
- [ ] Signal Chorus loop still works.
- [ ] Third morph still works if continuing.
- [ ] Bloom Residue loop still works if continuing.
- [ ] Right-stick / IJKL camera still works.
- [ ] R3 / C recenter still works.
