# INSPECTION_AND_ACCEPTANCE_PLAN — WC01 v0.2

## Design and Canon Review before release

After the World Census and Gap Assessment, classify each gap and apply the [Design and Canon Review](DESIGN_AND_CANON_REVIEW.md). Record Authority, dispositions and open decisions in the [Design/RFI Register](DESIGN_RFI_REGISTER.md). Construction issue needs an approved specification linked from the owning blueprint, covered dependencies and explicit execution authorization. Independent verification or verified defect repair may qualify within its own scope. This review adds a release gate. All existing Trade, Experience and Integration inspections still apply after implementation.

## Admission and parallel execution

Use the exact [snapshot identity](../manifests/baseline.json), [full snapshot fingerprint](../manifests/snapshot-digest.json) and [verification results](../manifests/baseline-verification.json). A HEAD-only Git checkout omits the current edits. WC01 previously verified three independent local file copies. Future construction uses isolated Git worktrees after approved baseline publication. Each trade requires explicit execution authorization.

1. Keep the admitted snapshot as the immutable-by-policy comparison source.
2. Work in only the assigned trade's source copy, with its allowlist and scope checker.
3. Export candidate files, changed-file SHA-256s, test logs and observations.
4. Require passing Trade, Integration and Experience reviews in that order before candidate admission. No inspector edits another trade's files.

[Trade Inspector](../inspectors/TRADE_INSPECTOR.md) · [Experience Inspector](../inspectors/EXPERIENCE_INSPECTOR.md) · [Integration Inspector](../inspectors/INTEGRATION_INSPECTOR.md) · [Report template](../inspectors/INSPECTION_REPORT_TEMPLATE.md)

## Controlled integration

After separate authorization, provision a candidate from the published baseline. Follow the [GitHub inspection workflow](../operations/INSPECTION_WORKFLOW.md). Apply only manifest-listed reviewed files. Recommended order: P03, P02, then P01. This checks route guidance with the smallest surface first, verifies Vascular and C2 parity next, then validates the two-owner Shelf presentation. The packages have no implementation dependency on one another. At each step rerun the affected suite, scope/hash and shared-interface checks. Failed packages stay outside the candidate.

Combined: Wave 1 and Core profiles, I2-B, F1 and B5-C2, B5-B and C2, B1/B3/B4, C63/T1, stabilized aim, Silt grip/seat/return, Core Work depth, current Gathering smoke, current Comb/Aperture normal route proof, and production build. Preserve 3→6→12, mount/return, movement, camera, mappings, material, progression, and HC027D1 audio. Historical failures in baseline logs remain separately tracked.

## Human verification

1. Hub direct routes, distant versus ready, optional readings, return arming and real Comb lock.
2. Silt selected only, blocked, aligned, accepted, released, Far/Near under held RT, labels off and unchanged sediment control. Repeat with inspection and Core Work interruption.
3. Vascular neutral rhythm, brace, projection, scatter and recovery, then authenticated C2 response on a matched visit. Separate a Relay answer from the route response.
4. Grave recoverable versus retained effect and purple landmark ID capture. Validate Comb, Aperture and one Gathering repeat using normal progression and returns.

## Rejection, rollback and as-built reporting

Reject out-of-scope changes, unexplained trace differences, misleading cues, historical ref changes or missing required inspections. Re-provision a separate clean candidate and add only the still-approved packages. Preserve rejected evidence and leave the original checkout untouched. Do not use an original-checkout reset for rollback.

Update the same runtime-ID records in the reference set. Record as-built revision, exact files and hashes, owner and contract implications, acceptance commands and captures, unresolved questions, and decision history. Canon requiring the full rebuild blueprint remains open. Compare delivered behavior and meaning against the approved specification. Open a discrepancy RFI for unresolved variance. Keep historical evidence and record the new as-built revision.
