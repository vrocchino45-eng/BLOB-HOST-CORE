# CONNECTION18 — Stabilize contact feedback

Changed-files presentation repair for the CONNECTION17 playable build. Earlier HC/LS1 labels remain indexed. This is not a standalone game.

## Install

Extract this ZIP beside package.json in the existing BLOB-HOST-CORE folder:

```powershell
node .\APPLY_CONNECTION18.mjs --check
node .\APPLY_CONNECTION18.mjs --apply
```

Reload the game afterward. The installer verifies its CONNECTION17 baseline and saves exact original files in CONNECTION18_BACKUP. It refuses unknown or later edits rather than overwriting them. Restore with `node .\APPLY_CONNECTION18.mjs --restore`.

## What changes

- The existing Stabilize field anchors to the object's world position, including beneath translated, rotated or scaled parents. Its tether starts at the Core's world position. Unparented objects retain their existing coordinates.
- Visual acquisition resets when the Stabilize target changes or a released contact starts again. The previous object's fully aligned appearance cannot carry to a new contact.
- When the current object has a published reactive material condition, the three existing gyro bands keep more disagreement while that condition is unstable. They can settle as the actual ReactiveStateGrammarSystem improves the material. Presentation reads that state; it does not perform the repair or award completion.
- Unknown materials, committed Silt visual previews, and ambient fields retain explicit visual-acquisition fallback. They do not borrow another object's condition or claim a verified material result.

There are no new meshes or rings. Pulse, Absorb, targeting permission, repair rates, interaction thresholds, camera/movement, material conservation, Host receipts, progression and the audio mix baseline are unchanged. The existing Stabilize visual-acquisition value now restarts per contact; it is explicitly labeled as presentation, not gameplay completion.

## Pass contract

Mode: convergence repair. Purpose: make the existing Stabilize response belong to the actual contacted body and its reported condition.

Allowed scope: one existing production presentation file, plus optional audit utilities and an old-source comparison fixture. Locked: gameplay ownership, target selection, chemistry laws, conservation, Host causes, completion/credits, input mapping, camera, geometry, timing policy, 3→6→12 architecture and HC027D1 mix baseline.

Delete/disable targets: no systems removed; prevent alignment carryover and local/world anchor mismatch. Visual/feel target: the target's field stays on the object and continues to disagree while the reported material is unstable. The same three bands carry that information without another effect layer.

Acceptance/regression: transformed anchors, target handoff, release/rehold, current-target-only material reads, coherent/unstable/missing-condition behavior, real-owner repair-to-presentation linkage, unchanged progression observations, existing quick bots and real-input Core Work placement. Human readability and in-motion feel remain open.

## Short human check

Hold Stabilize on a readable object, then move to another valid target. The second should start its own alignment. Where material condition is supported, watch the contacted object's field settle with its response. Release and rehold; check that the field stays on the object as the camera moves. A short focused session is enough.

This closes part of the contact-feedback opportunity. Pulse surface response, Absorb acceptance/direction, broader regional material hierarchy, authenticated connection replies and outcome-linked sound remain queued. The historical Silt disappearance and the human Core Work configuration comparison remain unverified.

## Evidence and optional utilities

See RESULTS_CONNECTION18.md and CONNECTION18_EVIDENCE. The root-level CONTACT_CHECK and CONTACT_BROWSER scripts are optional tests, not game entry points. The BEFORE_FIXTURE file is the exact old visual owner used for a controlled comparison and is not imported by gameplay. Browser reruns additionally need Playwright/Chromium. Internal screenshots are not included as deliverables.
