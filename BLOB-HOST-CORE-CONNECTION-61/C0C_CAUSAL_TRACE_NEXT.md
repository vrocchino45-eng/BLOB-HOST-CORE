# C0C-TRACE1: Host circuit causal observation — design candidate (not built)

## Why event counts alone are insufficient

A key press or `game-pulse-event` is an *attempt*. To demonstrate the Host as connected anatomy, future observations should distinguish **source influence → owner acceptance/rejection → component state transition → local physical/world consequence → presentation/Guide reading** across time and cell boundaries.

## Proposed low-noise semantic records (without introducing new runtime authority)

| Record | Minimum typed facts | Authority boundary |
|---|---|---|
| Core verb attempt | `attemptId`, verb, input sequence, timestamp, target/candidate, Core composition/phase when published | Input/verb publisher only |
| Tendril/contact delivery | connection/attachment ID, endpoint identity, material/port type, actual contact, accepted/rejected reason | Existing contact/target owner only |
| Component transition | `causeId`, owner system/cell, component instance and behavior revision, accepted input port, state before/after, saturation/recovery, rejection reason | **Existing component owner** only |
| Cross-region receipt | source receipt ID and sequence, receiver ID, typed `signal.provenance_receipt`, duplicate/gap status | Existing Host ledger and Vascular receiver only |
| World result | change to owned motion/flow/material identity, trace to cause, distinction between local change and source-only observation | Existing region/material owner only |
| Player-visible echo | renderer/Guide cue ID, rhythm/resonance/geometry change if real, scene time | Read-only presentation; **never** claim world mutation itself |

## Expand observation coverage before changing world behavior

- Track sparse *meaningful transitions* in **pre-Hub arrival → Guide Threshold → Hub → Silt/Vascular/Grave** (visited cell, entry/exit, mount), not each frame of raw camera motion.
- Add published Core motor phase and **3→6→12** mode changes with internal Deep/Inner/Membrane composition **only where an authoritative source actually exists**.
- Track tendril attachment/detachment and its real contact endpoints when published. `LT+A` grip remains contextual, not a fourth verb.
- Capture shell/casing **candidate** identity or actual material/owner changes separately; do not invent a constructed shell claim.
- Hub/watcher/Guide interpretation should reference genuine known identity/receipt/phase state, not manufacture changes.
- For resonance, distinguish a source's phase/frequency from *measured coupling* and any accepted regulation; audio-only coincidence is not functional resonance.

## Engineering guardrails

1. Existing owners remain authoritative: no new global mutating event bus, no implicit signal-to-material or presentation-to-progress conversions.
2. Match on stable cause IDs, not timestamps alone; maintain explicit gap records if producer rings overwrite before sampling.
3. Do not sample audio or continuous movement in giant per-frame records. Prefer bounded snapshots + sparse transition receipts to keep user JSON manageable.
4. Start/end continuity must be verifiable even when the player plays 20–25 minutes; keep no invisible rollover or source-gap misreport.
5. Tests must assert actual transition count, provenance, dedupe, owner, before/after, and visible response **separately**.

## Candidate milestone order

- **C0C-REC1** (this patch): stop recorder-detail loss.
- **C0C-TRACE1**: full pre-Hub/Hub transition + Core verbs semantic lineage read-only.
- **C0C2**: shared accumulation behavior preserving Silt and Vascular owners/equations.
- **C0C2-VIS / C0C-RES**: observable geometry/resonance and physiological composition translation, only after truthful transition data exists.
