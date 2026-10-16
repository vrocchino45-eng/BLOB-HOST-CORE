# BLOB: HOST CORE — LS1D1D2K Contact Convergence

## Install / base
Apply this **changed-files only** overlay **on top of LS1D1D2J** (not standalone). Replace exactly:

- `src/contact/SiltCompressionContact.js`
- `src/routes/SiltPressureRouteSystem.js`
- `src/debug/WorldObjectCensusSystem.js`

Keep all other files, HC/LS1 history, Silt ecology, Guide, region travel, and data. **Do not** install deferred `BLOB_LS1D1D2E_AUTHORITY_GUARD_CHANGED_FILES.zip` as part of this pass.

## Pass mode / goal
**Convergence / contact pressure accessibility and lifecycle truth** after a real D2J session detected six contact entries, no new successful presses, and 23 attempts blocked at the existing 1.60-unit outward grip limit. Fix pressure behavior at contact without changing the movement model or rewards.

## Mechanical rule (single authored Silt catchment patch)
1. With LT + A, commit a living grain. The D2I camera-independent lock, initial headroom, maximum 1.60-unit outward and minimum 0.38-unit inward radii remain unchanged.
2. Move the held grain to the garden catchment patch. **Turquoise** means overlapping/contact.
3. Press **X / Pulse** **toward** the sediment. Either an accepted forward grain movement *or* a Pulse resisted by the existing outward tether stop can load pressure **only if the held grain is physically in the contact patch** and the projected Pulse points toward the patch. **Amber** means pressure loaded. Two qualifying presses form a temporary, **pale-gold** visual imprint.
4. A Pulse directed away or tangentially, a remote/candidate-only Pulse, an unrelated environmental Pulse or a simultaneous RT hold cannot compress the patch. A brief subdued coral cue indicates an overlapping but unproductive Pulse. The diagnostic receipt identifies `away-or-tangent`, `outside-radius`, `outside-height`, or `absorb-held`, with local distance/height where the patch is in approach range.
5. Hold **RT / Absorb** to withdraw a held grain. Contact pressure relaxes, the imprint reverses. Releasing the grain also resets contact pressure. There is no material intake from this patch.

**Important:** “Resisted pressure” is authored contact intent and a reversible surface response, **not** a physics force, rigid-body collider, new material mass, bond or permanent deformation. The virtual beyond-bound position only determines whether the intended direction would approach the patch; it never moves the grain. Pulse also retains its independent environmental pressure route.

## Separate repair: unmount and telemetry
On leaving Silt, any outstanding held RT pull is receipted, the committed material and any stranded Silt-only grip-owned records are returned to `environment` in the existing `MaterialIdentityLedger`, the grip is released, and published `siltMaterialAim` lock/candidate IDs clear **before the final inactive publish**. This does not transfer unrelated materials, change ownership type elsewhere, or reset the eight grain histories.

The recorder now snapshots the existing lifetime `cumulativePullDistance` counter **when Alt+Shift+R starts**, then reports `captureStartPullBaseline`, `authoritativeSessionPullDistance`, and compares the latter with this-session motion receipts. It no longer treats prior gameplay as missing sampled displacement. Existing bounded trace-gap limitations still apply.

## Locked and forbidden
Frozen: target selection, grip ownership in play, movement coefficients, D2I start offset, physical limits, environmental pressure/rib progression, canonical porous appetite, material recipes/composition, eight-unit closed Silt cycle, all ecology, Guide, passage geometry, player and camera controls, Hub/Surface transitions, historical HC and LS1 indices, and unrelated chemistry.

Forbidden: new contact surfaces, fracture, Core absorption, permanent imprint, extra Silt rewards/gates, material duplication or loss, changing global targeting, additional controller combinations, or architecture overlays.

## Acceptance / manual test (about 2–3 min)
- Start current D2J build with D2K overlay; move to low amber-brown garden contact patch.
- Alt+Shift+R to start REC. Lock a grain with LT + A.
- Guide grain into patch: verify **turquoise** contact. Pulse toward patch twice. Especially test **while at outward tether bound**: a qualifying directed resisted Pulse should still show **amber**, then **pale-gold imprint**. Aimed-away Pulse should not add pressure.
- RT pull grain away: surface recovers. Release and reacquire; verify same grain exists.
- Optionally exit Silt while a different grain is locked: ledger and published lock must release. Original completion and return fold remain unaltered.
- Alt+Shift+R stop; Alt+Shift+E export `BLOB_LS1D1D2K_OBSERVATION.json`.

## Validation / limitations
Targeted D2K edge bot: 27 passed. D2J contact+visual bot updated against D2K: 52 passed. D2I movement regression: 46 passed. Existing Silt environmental route: 14 passed. Recorder + identity cycle: 24 passed. **163 checks total** (some suites overlap), 3/3 JS syntax passes, ZIP integrity verified. These tests exercise genuine source methods with stubbed Three vector/material objects; they are **not** a full Vite/Three browser run or a visual/performance guarantee. Real player test is still required before calling this pass accepted.
