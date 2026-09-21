# HC-004QD — Bloom Runtime Readout and Pulse Consumption Fix

## Verified playtest findings
- Xbox pulse production was working.
- Bloom did not update `inputActionAudit`, so full debug falsely reported `consumedBy: none`.
- The tissue-shift panel could retain Nursery-era instructions while the active cell was Bloom.
- Stable Bloom still displayed the old first-minute lock wording instead of the existing Grave morph handoff.

## Implementation
- Bloom consumes each unique pulse event and records target/result.
- Grave morph takes over the same audit only when the fresh stable-fork pulse actually starts that morph.
- Active Bloom cell state overrides stale earlier morph readouts.
- Guide and tissue status expose the current Bloom step or fresh-pulse Grave handoff.

## Locked scope
No new cell, route, gate, door, teleport, branch menu, combat, dialogue tree, quest log, or entity spawn.
