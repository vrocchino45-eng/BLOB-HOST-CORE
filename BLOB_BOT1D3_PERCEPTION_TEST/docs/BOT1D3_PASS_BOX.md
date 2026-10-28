# BOT1-D3 — Convergence Pass Card

**Mode:** Test and audit only, no gameplay mutation.  
**Purpose:** Determine whether poor acquisition underlies prior Watcher/Guide gap before adding a sensor, Guide warning, range boost or physical circuit part.

## Locked systems

- Pulse, Absorb, Stabilize physics and input mapping; 3/6/12 Core engine.
- Watcher packet range (3.4 world units), contamination mix, event acceptance and Fold progression.
- Guide motion / reaction owner and GuidePromptSystem.
- REC1 owner witnesses from BOT1-C, BOT1-D, GUIDE0-W.
- C0E3 regional networks, Silt → Vascular → Grave circuit, all Host receipts.

## Allowed / forbidden scope

**Allowed:** new BOT1 scripts, read-only screenshot motion scoring, seeded ordinary keyboard/camera inputs, separate REC1 evaluator, screenshots and tests. **Forbidden:** scene queries for target IDs, position or geometry, local `frameState` reads for policy, world-state writes, bot teleports, intentionally injected material type, patched player controls, false progression credit.

## Experiments

| Trial | Policy | Causal question | Evidence |
|---|---|---|---|
| S | Movement/camera sweep | Can broader ordinary exploration close range? | Pulse ID, distance, reason, actual owner state |
| M | Screenshot motion + same fallback sweep | Does screen motion provide extra acquisition information? | Unclassified candidate, camera adjustment, owner acceptance after |
| I (optional) | Idle observer | What occurs without player action? | Passive nursery owner outcomes, Guide state |

Compare fresh trials but **do not** claim a controlled A/B win from two different world-material cycles. Seed and screenshots are retained, but material opportunities may vary by runtime conditions.

## Acceptance gates

1. **Instrumentation:** REC1 full retention, owner ID correlation, GUIDE0 samples/pairs and Fold witness readable.
2. **Actual acquisition:** `packetPulseReadAccepted=true` from Watcher, not a Guide pulse answer.
3. **Clean continuation:** owner-specific `tender_fed_clean_matter` and `foldInvitation=true`; bot sees an invitation in HUD.
4. **Fold completion:** Fold owner `completed=true`, not just reaching an objective label.
5. **GUIDE1-A diagnostic:** paired clean and scar **owner-authored outcomes** with Guide lastReaction and HUD/prompt; if either absent, verdict `UNKNOWN`.

## Failure triage

- No Pulse event → bot keyboard/input dispatch issue.
- Pulse observed, owner rejects `no_active_packet` → timing, wait/packet life cycle.
- Pulse observed, owner rejects `packet_out_of_read_range` → movement/perception/spatial cue issue; retain exact margin.
- Owner accepts clean, no invitation → authored prerequisite/gate or narrative progression mismatch; audit exact owner state.
- Owner accepts scar → valid harmful reading, not a lost Pulse; compare Guide concern vs available sensory evidence.
- Guide answers Pulse but owner rejects → expected possible animation semantics; don't call success.
- Visual motion cue misleads → bot perception issue, not proven world defect.

## Exit decision

No new circuit component unless the reproduced player-facing gap is specific enough to identify its owner and a testable remedy. Install the *smallest missing* sensor, response, or feedback element when proven. Retain original screenshots/REC1 and a rollback baseline. Historical HC/LS1/C0D/C0E lineage remains indexed.
