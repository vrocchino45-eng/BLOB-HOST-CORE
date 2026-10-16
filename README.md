# BLOB: HOST CORE — LS1D1D2I Motion-Feel Calibration

Apply **over D2H**. Only two replacement files: `src/routes/SiltPressureRouteSystem.js` and `src/debug/WorldObjectCensusSystem.js`. Extract `src/` over the live project; keep every other file and the HC historical index unchanged. **Do not apply the deferred D2E authority guard.**

## Mode and scope
**Convergence / feel calibration**, Silt committed grain only.

- **Initial headroom:** Newly grabbed grains are seated no farther than 1.15 units from the Core (maximum tether 1.6). Grains naturally closer remain at their distance. The selected and committed grain ID does not change. The acquisition receipt reports original and resulting radius. This is a small one-time kinematic positioning adjustment, not physics.
- **Boundary cue:** Reuse the target brackets: blue and expanding for outward Pulse, mint and contracting for inward Absorb; briefly coral at outward bound, violet at inward bound. One subtle local-space tether line is visible only while held. No new target acquisition, collisions, ownership, reward, or gameplay rules.
- **Pull receipts:** A small unfinished pull remainder is recorded when RT stops or grip releases; the recorder distinguishes sampled receipt totals from the authoritative cumulative displacement. Individual receipts can still be missed due to bounded 64-event history and 150ms recording sample.

## Locked systems
LT + A manual grip, A/LT release, candidate and held ID separation, SiltGripAuthority, material identity/mass (8), environment pressure Pulse and spatial-packet Absorb, chemistry, ecology, Guide, traversal, Hub/Surface return, and historic HC archive. **No material consumption or physics forces.**

## 60–90 second test
1. Alt+Shift+R once (REC appears), hold LT and press A to grip one grain.
2. **Pulse immediately**: it should visibly move outward now. Do several Pulses to find the outward limit (coral bracket flash).
3. Hold RT to pull inward (mint bracket). Continue until inner limit (violet flash), then Pulse again.
4. Turn camera to a second grain: the original committed grain should stay held. A or release LT to let go.
5. Alt+Shift+R again to stop; Alt+Shift+E exports `BLOB_LS1D1D2I_OBSERVATION.json`.

## Acceptance
- Initial grip has at least ~0.45 units of outward room when the unit starts outside 1.15; closer units are not pushed outward to a fixed radius.
- Pulse and Absorb change **committed** radius; brackets distinguish directional movement and hard limits, tether shows Core-to-held connection.
- No change in item ID/owner except original grip/release; no mass/recipe credit from motion. Original Silt pressure and packet routes still work.
- Recorder preserves independent route and material motion receipts and shows a qualified comparison with the final authoritative pull counter.

## Verification
See `BLOB_LS1D1D2I_BOT_RESULTS.json` (provided separately). Checks are **component tests**, not a browser-rendered playthrough. No performance metrics or gameplay visuals are claimed to have been user-verified yet.
