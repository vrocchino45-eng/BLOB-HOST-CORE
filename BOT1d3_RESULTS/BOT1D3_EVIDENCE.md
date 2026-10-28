# BLOB — BOT1-D3 Perception / GUIDE0-W Field Evaluation

Independent REC1 verdict. Camera and movement actions read only visible HUD and optional rendered pixel differences; they never read owner packet coordinates, material class, guide decision, or REC1 before choosing an action.

| Trial | Pulse inputs | Owner accepted | Closest Pulse (units) | Near misses | Guide pairs | Fold stage |
|---|---:|---:|---:|---:|---:|---:|
| BOT1D3_20261028T074343Z_sweep_s11 | 18 | 1 | 2.593 | 1 | 18 | 0 |
| BOT1D3_20261028T074513Z_motion_s12 | 15 | 0 | 3.899 | 1 | 15 | 0 |

## Case-by-case evidence

### BOT1D3_20261028T074343Z_sweep_s11
- Status: `CAPTURED`; 76.166 s, 1130 events, dropped 0.
- Bot actions: `{'observe': 2, 'move': 35, 'look': 31, 'pulse': 18, 'visible_invitation': 1}`; visible motion candidate frames: 0/0.
- Owner reasons: `{'packet_out_of_read_range': 13, 'no_active_packet': 4}`; accepted: 1; uncorrelated Pulse IDs: []
- Guide reactions: `{'guide_waited_for_world_response': 446}`; outcomes: `{'tender_fed_clean_matter': 1, 'tender_strained_by_unread_contamination': 4, 'tender_passively_received_clean_matter': 1}`.
- Invitation: owner=True, bot-visible=True; Fold completed: False.
- Evidence limits: Both clean and scar player-authored outcomes not observed in this run.

### BOT1D3_20261028T074513Z_motion_s12
- Status: `CAPTURED`; 76.234 s, 702 events, dropped 0.
- Bot actions: `{'pulse': 15, 'move': 21, 'look': 16, 'observe': 6}`; visible motion candidate frames: 20/20.
- Owner reasons: `{'packet_out_of_read_range': 11, 'no_active_packet': 4}`; accepted: 0; uncorrelated Pulse IDs: []
- Guide reactions: `{'guide_waited_for_world_response': 497}`; outcomes: `{'tender_passively_received_clean_matter': 3, 'tender_strained_by_unread_contamination': 4}`.
- Invitation: owner=False, bot-visible=False; Fold completed: False.
- Evidence limits: No owner-accepted packet read in this run; Both clean and scar player-authored outcomes not observed in this run.

## Progression gate

G1-D3 is **passed only for acquisition** on trials with a real owner-accepted read. A clean-matter continuation requires a player-authored clean outcome and a separate Fold invitation; a Fold completion requires an owner completion witness. A Guide response is not the same as an owner-accepted read. The two profiles are exploratory comparisons, not controlled A/B performance claims: run order and random material cycles can differ.

## Next circuit decision

Use witnessed failures to place a justified *sensory/feedback component* only after repeatable player-facing evidence. A motion-cue candidate means visible pixels changed; it does not identify clean or scar matter. No Host receipts or player physical motion can be inferred from visualization events alone.
