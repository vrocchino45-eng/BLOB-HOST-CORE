# GitHub coordination drafts

These are offline drafts for `vrocchino45-eng/BLOB-HOST-CORE`. The GitHub repository is public. Review wording and attachments before publishing, and confirm each proposed label exists. No issue numbers, label creation, reviewers, or PRs have been assigned.

| Draft | Proposed labels | Publication condition |
|---|---|---|
| [P01-A Shelf connector](issues/P01-A-shelf-connector.md) | trade, defect, ready-for-construction, inspection | Publication and execution approval are separate. Send only S01, the settled view-only scope. |
| [P01-B Shelf cue investigation](issues/P01-B-shelf-cues.md) | trade, audit, blocked, inspection | Authorize verification separately. Cue suppression remains held. |
| [P02 Vascular readability](issues/P02-vascular.md) | trade, ready-for-construction, inspection | Publish after approved baseline and draft approval. Keep broader design RFIs out of this issue. |
| [P03 Hub guidance](issues/P03-hub.md) | trade, audit, blocked, inspection | Close H01 evidence dependency before requesting a code change. |
| [World Census follow-up](issues/census-follow-up.md) | audit, inspection | Independent read-only evidence collection. |
| [Gameplay design RFIs](issues/design-rfis.md) | design, blocked | Record decisions before requesting implementation. |
| [Canon RFIs](issues/canon-rfis.md) | canon, blocked | Require authority, separate documented meaning from proposals. |

## Label meanings

`trade` scoped work order · `design` gameplay decision needed · `canon` lore or authority review · `defect` verified behavior disagrees with existing specification · `audit` evidence-only work · `blocked` specific dependency outstanding · `ready-for-construction` specification ready, execution still controlled · `inspection` independent review or evidence required.

## PR templates

- [Trade draft](pull-requests/TRADE_PR.md) for an authorized trade branch targeting the provisional integration candidate.
- [Candidate or promotion draft](pull-requests/INTEGRATION_PR.md) for the coordinator.

Copy the relevant body after publication is authorized. These files do not install a repository-wide template or change repository settings. Use the [inspection workflow](../operations/INSPECTION_WORKFLOW.md) and [authorization matrix](../operations/AUTHORIZATION_MATRIX.md).
