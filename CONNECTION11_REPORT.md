# CONNECTION11 — source identity for integration evidence

November 12, 2026. Mode: convergence / test-evidence tooling. Milestone served: reliable verification of the protected world–Core slice toward R6. No production change.

## Selected gap

CONNECTION10 protected the consequence loop with a normal full-suite run. Its local raw fingerprint matched the earlier local CONNECTION5 run, but differed from the user's uploaded aggregate fingerprint. The old summary did not contain a per-file manifest, so that difference could not identify changed paths or establish whether line endings explained it.

This pass adds comparable source evidence rather than guessing at the old difference. It does not retroactively prove equivalence with that uploaded run or declare a gameplay defect.

The next feature previously discussed as C0E3 is already present in current source: regional territories, local transmission, saturation relief and regional presentation language. Rebuilding it as if absent would duplicate existing work. No new regional behavior, global Host recovery law or gameplay modifier is selected here. CONNECTION7's extra Absorb-current term stays parked.

## Pass contract

Purpose: make future bot reports identify the gameplay files they tested, with useful differences across ordinary text checkouts.

Allowed scope: source-manifest utility, comparison command, report metadata, harness self-checks and guarded delivery. Locked: all src/public files, package/index production files, gameplay owners, controls, camera, movement, audio, material/receipt/credit/reserve laws and 3→6→12 geometry. Keep all existing gameplay and case IDs. Delete/disable targets: none. Visual/feel target: preserve the accepted build; no visual acceptance is claimed.

Acceptance: equivalent LF/CRLF text checkouts produce matching identities; real content changes are reported by path; binary data stays exact; the old byte mutation guard still fails any in-run byte change; legacy reports remain readable as historical evidence without fabricated manifests.

## Implementation

Completed summaries retain `sourceFingerprint` and `productionFilesUnchanged`. They additionally contain `sourceIdentity`, with schema/policy, canonical sorted relative paths, per-file hashes and aggregate fingerprint, plus `sourceIdentityUnchanged`.

The identity covers src, public and existing root package.json/index.html. Recognized UTF-8 text extensions normalize CRLF to LF only. Binary bytes remain exact. Whitespace, UTF-8 BOM, final newline and code/data changes remain significant. Invalid UTF-8 in a declared text file fails collection. Paths use forward slashes and code-point ordering; the absolute workspace location and creation order are excluded.

Harness files, dependencies, built dist files and runtime state are outside the gameplay identity. Thus identical identities do not establish identical browser/dependency environments, identical harness versions, trustworthy receipts, human perception or an uninterrupted campaign. Test reports still identify their harness baseline, cases, fixtures and results separately.

The comparison command validates manifest structure and its hash before comparing. It returns 0 for equivalence, 1 for changed/added/removed files and 2 for missing/invalid/unsupported identity. A legacy aggregate hash alone cannot supply the missing file manifest. It is never silently upgraded or used to guess equivalence.

## Validation

| Check | Result |
| --- | --- |
| Identity utility controls | 11 groups PASS, zero failures |
| Full actual-source CRLF checkout fixture | All 704 gameplay files compare equal after recognized text conversion and relocation |
| Runner failure controls | Existing six controls PASS |
| Byte-only mutation control | Runner exits nonzero even though portable identity remains equivalent |
| Quick catalog | 14 cases, 261 checks PASS; six browser cases correctly NOT_RUN |
| Browser consequence loop C01 | PASS, all 18 internal assertions; other 19 cases correctly NOT_RUN |
| Current source vs quick summary | Equivalent, no differing paths |
| Quick vs browser source manifests | Equivalent, no differing paths |
| Guarded installer | Seven groups PASS: LF/CRLF application, idempotence, byte-exact restoration and incompatible/edit rejection |

The 704-file portable fingerprint is `5feff89ab45c4c44c4321ca1f2edfe43eac0e0f01aaf395719c18d3d74f7a610`. The legacy local raw fingerprint remains `10e285bfd0843863ece8ab5dbf3f66c6e98d2783ca1cfda120c5b00cb85a80e4`, matching local CONNECTION5/10.

CONNECTION10's 20-case/267-check full run remains the prior full-suite evidence. This pass reruns the quick catalog and one browser scenario for changed report plumbing, not a new full closeout campaign. The catalog still has 20 cases, 261 quick checks and six browser scenarios. Utility/installer self-check counts are separate and are not added to those totals.

## Outcome and next boundary

Gameplay is unchanged; source comparison is now actionable. A future uploaded summary can be checked against the same declared source policy, and mismatches can be traced to files before interpreting differences in gameplay results. No new force, local anatomy, region, unlock, UI panel or control is shipped.

The protected circuit and accepted motion remain the current integration baseline. Future gameplay passes should select an explicit missing interaction or demonstrated player-facing problem from that baseline; neither a raw hash difference nor an old feature name alone justifies rebuilding systems. Human readability, physical controller delivery, fresh campaign coverage and the unreproduced intermittent Silt disappearance retain their existing qualifications.
