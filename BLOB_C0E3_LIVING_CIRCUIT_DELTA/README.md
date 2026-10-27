# BLOB C0E3 — Living Regional Circuit

**Baseline:** exact C0E2-B installation. This is a guarded delta of **five files**: two gameplay files (one new) and three test scripts (one new). No new region owners, physics/controller changes, or Host receipts.

## What changed

- **Four distinct regional body rhythms.** Silt compacts and sheds local strain; Vascular dilates with a faster transmission rhythm; Grave's layered memory plates offset with retained imprint; Hub roots answer in coordinated counterphase. These are presentation-only deformations.
- **Real-time directional visual pulses** now travel along the existing six strands in each region. Only existing C0E2-B local transfers reach other sites; fully saturated no-transfer events produce a short recoil/dissipation that **does not** reach a neighbor. Multiple rapid button presses do not continually reset a traveling signal. At most one packet per directed link, 24 packets for all four mounted regions combined.
- **Fully saturated networks** can vent a small, bounded amount of local capacity, only from a deliberate interaction and subject to a 1.2–1.65 second cooldown. This affects only the C0E1/2 local strain/void state, not world material or Host ledgers. Local states still persist during the session and across regional remounts.
- REC1 export format and hotkeys unchanged. Existing `c0e1-territory-verb-read.read` events gain `livingCircuit` with `relief` and `emittedPackets`; `territoryExploration.c0e3` includes wave/relief counters.

## Install

Extract `BLOB_C0E3_LIVING_CIRCUIT_DELTA` next to `src` inside the existing BLOB-HOST-CORE project. In VS Code PowerShell:

```powershell
node BLOB_C0E3_LIVING_CIRCUIT_DELTA/apply.mjs --check
node BLOB_C0E3_LIVING_CIRCUIT_DELTA/apply.mjs --apply
node BLOB_C0E3_LIVING_CIRCUIT_DELTA/validate.mjs
npm run build
```

The initial check **must** report `C0E2B_READY`; if it says `DIFFERENT`, stop rather than bypassing the guard. `C0E3_INSTALLED` means no reinstallation is necessary. Backups are retained in the delta folder and Git-ignored. An unchanged installation can be rolled back with `node BLOB_C0E3_LIVING_CIRCUIT_DELTA/apply.mjs --revert`.

## Focused playtest

1. In Hub or Silt, Pulse near a C0E1 site; watch for a signal moving along the connective tissue rather than only blinking at the point of contact.
2. Repeatedly Pulse until saturated. Look for a short local discharge that **does not** traverse the entire link; try Stabilize or Absorb to reopen capacity.
3. Visit Grave and Vascular to compare their slower memory echo versus faster vascular contraction. Revisit an altered site to check session memory.
4. If possible, try reaching Silt Deep Reservoir; it remained unreached in the prior field test, but C0E3 intentionally does **not** modify its movement volume.

Use **Alt+Shift+R** to record and **Alt+Shift+E** to export REC1. A short video is needed to judge real visual clarity and performance.

## Locked / limits

C0D1–C0D3 authenticated interregional circuitry, C0E2-B math, route completion, Grave II resonance, Hub commits, controller inputs, movement envelopes, physical materials and chemical reactions are all unchanged. The new reactions are local presentation and bounded state adjustments only. The mock scene tests do not prove a real browser render, reachability, camera legibility, or Windows Vite success.
