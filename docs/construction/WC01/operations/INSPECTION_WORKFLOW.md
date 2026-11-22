# GitHub inspection workflow

The approved sequence is **Trade PR → Trade Inspector → Integration Inspector → Experience Inspector → approved integration candidate → human playtest → as-built update**. A release, branch promotion or ownership decision has its own approval. A green check alone cannot grant authority.

| Gate | Evidence and authority |
|---|---|
| Trade PR | Agent submits a draft targeting the provisional WC01 candidate, with exact base and head SHAs, released work order, blueprint and RFI refs, name/hash manifest, test commands and parity evidence. Agents work only in their assigned trade worktree. |
| Trade Inspector | Confirm released scope and baseline, file allowlist, method-level constraints, focused tests and required evidence. Return failures to the assigned trade. |
| Integration Inspector | Check base/head and shared interface compatibility, mounted lifecycles, deterministic traces and combined parity. Use a disposable local review checkout for combined evidence, before candidate admission. |
| Experience Inspector | Check player intent, cue truth, native Vascular and Hub readability, protected controls and controller evidence. Approval covers the reviewed SHA. New commits reopen affected reviews. |
| Approved candidate | Only the coordinator may admit reviewed heads to `integration/wc01-candidate-01`, after explicit integration authorization for the listed SHAs. Order P03, P02, P01 among eligible packages. Apply only passing scope. No auto-merge. |
| Human playtest | Build from the pinned candidate SHA in a separate checkout, no dev server from a trade. Run normal-route, accepted/rejected cues, remount and regression checks. Record controls, flags and telemetry against that SHA. |
| As-built update | Record exact SHA, source-owner and blueprint parity, approved-versus-actual behavior, test and capture evidence and remaining RFIs. Human acceptance and a new authorization are prerequisites for promotion or release. |

## Candidate base after separate approval

Create a provisional base for authorized draft PRs at the pinned publication SHA. Check the ref is absent locally and remotely first. Creating or publishing this ref requires separate approval. At this point the candidate contains no trade code.

```powershell
git ls-remote --heads origin 'refs/heads/integration/wc01-candidate-01'
git show-ref --verify 'refs/heads/integration/wc01-candidate-01'
git branch integration/wc01-candidate-01 $Pinned
git push origin "${Pinned}:refs/heads/integration/wc01-candidate-01"
```

Verify the advertised SHA. Publish each separately approved trade branch only after its owner reviews the exact commit and scope. Open its draft PR against this candidate. The coordinator controls candidate updates.

Leave a failed package off the candidate. Reconstruct an isolated candidate from the same publication SHA and the remaining accepted heads. Preserve the failed evidence and original source checkout.

The repository already has a Connection 62 workflow that runs on pull requests. After publishing is authorized, separate its baseline findings from WC01 evidence and record both. This setup does not alter GitHub rulesets, labels, Actions or reviewers. On GitHub, the coordinator may propose protected candidate/baseline refs, required independent review and prohibited force pushes as a separately authorized action.

Explicit approval is required for new canon, new mutable gameplay ownership, shared interface changes, integration into the authoritative branch, and release. Only the project owner can approve publication or promotion. An inspector may reject a package and open an RFI, while the trade owns its correction.

[Trade Inspector](../inspectors/TRADE_INSPECTOR.md) · [Integration Inspector](../inspectors/INTEGRATION_INSPECTOR.md) · [Experience Inspector](../inspectors/EXPERIENCE_INSPECTOR.md) · [Existing inspection plan](../reference/INSPECTION_AND_ACCEPTANCE_PLAN.md) · [Design and Canon gate](../reference/DESIGN_AND_CANON_REVIEW.md)
