# HC-031K-HF1 — Contact Lock Closure

## Mode
Hotfix convergence. Parent: HC-031K Surface Contact Intent Lock.

## Purpose
Close the remaining authority-loss bypass seen in the K playtest without increasing adhesion or retuning free movement.

## Evidence
The K run retained zero movement-progress blocks and produced a long successful surface attachment that ended through deliberate away input, but four short attachments still exited through `contact_authority_lost`. The remaining code path allowed global `contactAllowed` loss to detach immediately even while the K owner-continuity window was otherwise valid.

## Implementation
- `contactAllowed` is now part of live contact resolution instead of an immediate detach command.
- A brief global contact-permission drop enters the existing 0.30–0.40 s owner-grace window.
- The last reliable owner surface, contact point, and normal remain authoritative during that unresolved window.
- Compatible surface-ID transfer still happens before loss evaluation.
- Deliberate peel remains dominant and retains the J1/K thresholds, cooldown, clearance, and outward handoff impulse.
- Runtime attachment state now stamps `HC-031K-HF1` directly.
- Session telemetry advances to `blob.session.telemetry.v1.30` and exports an explicit `implementationPass` stamp so stale build metadata is easier to detect.

## Explicitly Locked
No free-flight, boost, camera, targeting, verb, ecology, route, progression, tendril-contact, support-plane, or surface-truth retuning.

## Exit Condition
A focused run should show deliberate surface release remaining immediate while short incidental permission/support gaps are tolerated. Remaining unintended detaches should be genuine sustained losses or incompatible-surface changes, not generic `contact_authority_lost` flicker.
