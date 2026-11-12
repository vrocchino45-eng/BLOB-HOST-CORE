# BLOB: HOST CORE — PAIRED-DEMAND2

November 9, 2026. Mode: first earned-six physiology implementation. Baseline: accepted Silt II / SILT-MODE1 plus CORE-READ1. Two production files change: the existing reserve owner and its existing HUD consumer.

## Install

Install CORE-READ1 first. In the BLOB-HOST-CORE project root:

```powershell
Expand-Archive -LiteralPath .\BLOB_PAIRED_DEMAND2_DELTA.zip -DestinationPath . -Force
node .\APPLY_PAIRED_DEMAND2.mjs
```

Reload the game. Both source versions and both payloads are checked before writes. Original files are saved in PAIRED_DEMAND2_BACKUP. Unknown/later versions are refused; repeat application is safe.

```powershell
node .\APPLY_PAIRED_DEMAND2.mjs --check
node .\APPLY_PAIRED_DEMAND2.mjs --restore
```

Restore uses verified original backups and refuses unknown later edits. Runtime progress retains the existing session-local behavior; this patch adds no save system.

## What changes

After six distinct credits unlock six-phase, simultaneous real verb demand consumes reserve more efficiently. Use the existing controls; no new combination or exact timing requirement is introduced. For example, LT + RT / Q + right mouse coordinates Stabilize and Absorb. It does not create an interaction with an object that lacks those affordances.

The saving grows with the shared fraction of actual demand. Two equal contributions reduce reserve drain by 10%; three equal contributions by at most 13⅓%. The displayed percentage varies with real demand and commitment. Pulse contributes through its existing release envelope; holding an unreleased Pulse does not invent extra demand.

The HUD shows “paired drain −N%” only when the reserve owner reports a realized saving in that update. It appears in the existing world drive line and Core inspection readout. It clears when no actual saving occurs, including idle, a single contributing function, boost priority, incomplete topology, zero elapsed time and an empty reserve. The percentage describes the drain-rate reduction, not extra power.

Three-phase drain remains exactly baseline. O preview does not grant physiology: eligibility reads the earned progression ceiling. Twelve-phase preview after earning six adds no stronger effect. Future twelve-credit publications would retain this same bounded earned-six law until their own contract; no earned twelve-phase content is added.

Boost and boost-plus-verbs retain their existing costs. Capacity, idle recovery, individual verb costs, commitment timing/movement penalties, targeting, output laws and radial traits retain their existing formulas. Conserving reserve can indirectly preserve existing fatigue-dependent verb/boost performance later; this is an intended consequence, not a claim that all outputs stay equal after different reserve histories.

Deep remains the endurance-oriented placement, membrane the faster-draining output placement, and inner the control placement. There is no zone-specific upgrade bonus table.

## Ownership and scope

CoreRadialPerformanceSystem remains the single reserve owner and now consumes the existing earned phase ceiling. It publishes coordination eligibility, factor, reason, baseline/effective drain rates and realized reserve saved. CoreEngineSystem does not gain gameplay authority. The HUD reads this publication and cannot award credits or supply receipts.

Formula: S = sum of actual Pulse/Absorb/Stabilize demand; M = maximum of those contributions; sharedFraction = (S − M) / S, or zero at no demand. When eligible, coordinationFactor = 1 − 0.20 × sharedFraction. Multiply existing reserve drain after its existing demand cap by that factor. The 0.20 prototype coefficient matches PAIRED-DEMAND1; no new tuning was required by the implementation checks.

Purpose: implement a measurable consequence of earned counterpart phases. Allowed scope: the existing reserve owner and minimal owner-driven feedback. Locked: accepted regional goals/credits, source receipts, Silt matter/contact/seat/trajectory, Guide, movement/camera controls, placement ownership, Core geometry/sequencing, audio reference, first returns and Hub crossings. No production delete target. No new material, chemistry reactions, region, Phase III/IV completion or persistence feature.

## Validation

- 69 checks passed against the actual changed owner and original source: exact three-phase parity across eight input patterns/four placements; six-phase single-function/idle/boost parity; paired savings; direct modifier parity at equal reserve; debug exclusion; incomplete topology; dt/clamping; empty-reserve feedback; actual Pulse release envelope; three-function bounds; real credit/Core consumer transition at the sixth supplied completion and duplicate protection.
- Controlled five-second paired holds from full reserve matched the accepted offline candidate: Deep 80.22→82.04%; inner 63.73→67.18%; membrane 14.20→22.70%; balanced 63.52→67.00%. These are baseline-versus-patch model comparisons, not human play measurements.
- Running browser used real Q/right-mouse input and existing registry scheduling. Five credits and O six-phase preview produced no saving. The actual counter consumed a supplied sixth completion and paired demand became active. World and inspection readouts showed the saving. Boost, single Stabilize, Core Work input suspension and world idle cleared it. Return to world retained six credits. No recorded JavaScript/console errors.
- Browser qualification: earlier returns and completion records were controlled checkpoint fixtures; the harness did not earn those goals naturally. Existing topology came from the running build. No reserve result, normalized input or coordination output was forced.
- Seven guarded installer checks passed, including both targets, repeat application, restore, preservation of later edits and second-payload corruption refusal before any source write.
- Vite production build passed with the existing large-chunk warning. Exact Three.js 0.179.1 and Vite 7.1.0 were exercised; full transitive dependency-lock parity remains unestablished locally.
- Locked owner hashes remain unchanged. Existing accepted material/Guide/route evidence is retained rather than rerunning unrelated suites for unaffected files. The previous CORE-READ1 architecture-label checks remain applicable; its formatter source is unchanged.

Human feel acceptance remains pending. A short comparison is enough: with earned six-phase and retained Core pieces, hold a useful pair of verbs, observe the paired-drain line, then release one or use boost and see it clear. Existing Silt II round-trip acceptance remains closed; replay is not a requirement for this patch. If the current session has fewer credits, O alone will intentionally show no benefit.

Evidence includes tests, browser state/input/owner receipts, build output, exact source diffs and unchanged-owner hashes. Screenshots were internal only and are excluded from the ZIP.
