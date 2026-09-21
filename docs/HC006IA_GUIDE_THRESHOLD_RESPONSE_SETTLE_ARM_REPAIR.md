# HC-006IA — Guide Threshold Response-to-Settle Arm Repair

## Observed live failure

The Guide Threshold reached `release_at_settling_point` at 84% with alignment and traversal complete, LT released, and the player outside the narrow current corridor. The previous post-release latch could only help after a release had already been accepted. It did not preserve eligibility during the timed tissue-response stage that occurs before the release prompt.

## Root cause

The transition into stage 5 cleared all settling-zone state. During the preceding response beat, ambient Scar-Flow movement could displace the player beyond the authored ribs. Stage 5 then asked the player to reacquire an already-completed traversal position.

## Repair

A natural stage-4 completion now publishes a durable `settleReleaseArmed` handoff when movement, resonance, traversal, and tissue response are complete. Stage 5 accepts LT release from either:

- the currently visible settling-rib zone, or
- the earned `completed_threshold_response_handoff` arm.

An artificially forced stage 5 without earned traversal remains blocked outside the ribs.

## Locked systems

- HC-006I region/mode/registry ownership
- canonical controls
- persistent tight camera
- Surface Wake
- Signal Chorus
- Grave route and return
- Guide Threshold traversal requirements and timing
