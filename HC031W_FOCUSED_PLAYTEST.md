# HC031W Focused Playtest — Controller / Targeting / Surface Audit

This is an audit run, not a control fix. Existing HC031V targeting behavior is intentionally unchanged.

## 1. Reach Gathering Ground
- Start normally or use `Shift+8`.
- Complete the existing Ridge → OBS3 → relationship → OPEN → entry sequence.
- Confirm the HUD shows the new `W CTL` and `SURF` lines.

## 2. Deliberate LT + RS mismatch test
Repeat this several times around the Watcher and relays:
1. Look directly at one readable object until it owns attention.
2. Hold **LT / Stabilize** so a relationship is active.
3. Keep LT held and deliberately push **Right Stick** toward a different nearby visible noun.
4. Watch the audit line:
   - `C` = camera candidate
   - `A` = attention owner
   - `R` = relationship owner
5. If camera intent has moved to a different valid candidate while Stabilize protects the old owner, look for:
   `stabilize_protects_old_attention_during_rs_redirect`
6. Release LT while keeping the camera aimed at the new candidate and observe whether attention then releases/reacquires normally.

Do at least one slow RS redirect and one strong/fast redirect.

## 3. Distance test
While holding Stabilize, intentionally look/work from a few different ranges. Note any:
`stabilize_relationship_beyond_assist_range`

Do not treat it as a failure by itself; W is measuring how often this current behavior occurs.

## 4. Surface capability audit
Move around the Gathering Ground floor/anatomy, including near the Watcher, relays and Matter Spill/Ridge-return area.

Expected W result before W1 surface authoring:
`SURF 0 · NONE · no_authored_crawlable_surfaces_in_active_cell`

If `SURF` becomes nonzero anywhere in this cell, capture where it happens; that would reveal an inherited/authored surface we did not expect.

## 5. Normal ecology sanity
You do not need another long ecology test. Briefly confirm LIFE/LOOP still responds normally so the audit did not disturb HC031V/U2.1 behavior.

## 6. Export
Press **Shift+T** and send the JSON. A short video is useful if the target appears to jump/look somewhere surprising.

## Acceptance / next decision
W succeeds if telemetry can show:
- candidate vs attention vs relationship separately
- LT value and RS magnitude during the mismatch
- at least one real current-policy redirect-block case if you can reproduce the problem
- actual authored surface count in Gathering Ground
- no regression to existing ecology/traversal

The W result determines W1; W itself does not change targeting or add surfaces.
