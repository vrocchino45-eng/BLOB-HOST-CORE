# HC-003C — Opening Flow Trim / First-Minute Pacing

## Purpose

HC-003C turns the HC-003B Guide prompt layer into a more playable first-minute flow.

The goal is not to widen the game. The goal is to make the first contact with the host feel readable:

```text
wake inside membrane
→ identify safe seed
→ hold absorb long enough to bond
→ understand scar as unsafe memory
→ pulse tissue into first fold
→ stabilize Scar-Flow
→ tune Signal Chorus
```

Bloom Residue Fork remains playable but is treated as the first beyond-minute fork.

## Build Mode

```text
convergence / pacing / readability
```

## Added Runtime Ownership

```text
src/opening/OpeningPacingSystem.js
```

Owns:

- first-minute stage readout
- opening safe-seed readability cue
- first-minute target-focus bias
- opening camera bias state
- Guide prompt cadence state
- first-minute progress readout

Does not own:

- morph logic
- target picking implementation
- bond chemistry rules
- guide dialogue
- cell creation
- camera architecture

## Added Data

```text
public/data/pacing/openingFlowTuning_HC003C.json
```

The data defines:

- required first-minute cells
- beyond-minute optional cell
- target duration
- safe-seed tuning
- opening camera bias
- guide prompt cadence
- first morph language

## Tuning Changes

### Safe seed

The safe seed has been moved slightly into the opening camera pocket and enlarged a little for early readability.

### Soft bond

Soft-bond tuning has been made slightly more forgiving for the first absorb:

```text
formation range: slightly increased
absorb range: slightly increased
absorb threshold: slightly reduced
assist range: slightly increased
confirmation rate: slightly increased
```

This should make the first absorb feel like a guided bond instead of pixel-perfect pickup hunting.

### Camera

The opening camera now receives a short first-seed bias if the player has not manually moved the camera.

The existing right-stick/IJKL camera controls still override the feel naturally.

### Prompt cadence

Guide prompts hold a little longer during the first seed stage so the prompt does not flicker between debug-like states.

## Forbidden Scope

- no new cells
- no fifth morph
- no doors/gates/teleports
- no dialogue tree
- no quest log
- no combat
- no save/load
- no Act 2 expansion
