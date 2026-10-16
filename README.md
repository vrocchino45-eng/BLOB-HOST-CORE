# BLOB: HOST CORE — LS1D1D2L Stabilized Surface Contact

## Install / base
Apply this **changed-files only overlay ON TOP OF LS1D1D2K**. It is not a standalone build. Replace exactly:

- `src/contact/SiltCompressionContact.js`
- `src/routes/SiltPressureRouteSystem.js`
- `src/debug/WorldObjectCensusSystem.js`

Keep all other files, HC/LS1 history, Guide, core, Silt ecology, region travel, and data. Do not install deferred D2E authority guard as part of this pass.

## Goal and active build mode
**Convergence — first stable, reversible material-to-surface relationship.** A four-minute D2K field test detected 47 contact entries but only one pressure press and no imprints. The player reported difficulty holding the Core/grain positioned over the patch. The problem is unstable contact, not a need to further tweak D2I movement numbers.

## New bounded brace behavior

1. Deliberately lock an eligible Silt grain using **LT (Stabilize) + A**; normal aiming and ownership apply.
2. Bring that actual held grain into the **same existing garden sediment patch**. While LT remains held, a **contact brace engages at the grain's actual position**, with a brighter turquoise ring and tether. No automatic remote targeting, snap-to-center, or new collider.
3. With the brace active, the grain is held at that world-local contact position while the Core drifts **up to 0.85 units from the engagement point**, subject to the **existing 1.6-unit grip limit** (extra safety margin: anchor must stay within 1.58 units of Core). The game does not stop Core movement, extend the tether or create a hard region lock.
4. **Pulse (X) while braced** channels a pressure attempt through the established Stabilize relationship. A first qualifying press yields amber pressure; a second yields a temporary pale-gold imprint. The grain need not repeatedly slide out of contact. The retained brace position is the pressure location; this is not a physics impulse.
5. **RT / Absorb** withdraws the grain and breaks the brace. Losing LT/grip, overextending the Core, losing actual contact, or switching held material also breaks it. A short 0.38s re-engagement cooldown prevents rapid flickering when the brace is overstretched. The reversible imprint relaxes; no material is consumed.
6. **Unbraced** Pulses retain D2K directional-approach/tether-resistance requirements. Pulse on an unheld grain, outside the patch, or during RT does not load a brace. Other regional verbs/progression are not touched.

## Feedback and telemetry
The sediment patch visibly lowers as pressure increases (up to 0.13 units, visual only), shifts turquoise on brace, amber on press, pale gold on imprint, and relaxes on withdrawal. The contact ring/tether shows the brace. The existing Silt region decision receipts now distinguish:

- `silt-contact:contact-brace-engaged` and `contact-brace-released`, including release reason
- `held-material-motion:stabilized-contact-resistance` (zero grain displacement, Pulse channeled through brace)
- `silt-contact:contact-pressed` with `pressMode: stabilized-brace`
- `silt-contact:temporary-imprint-formed` and `temporary-imprint-relaxed`

The recorder exports `BLOB_LS1D1D2L_OBSERVATION.json`, counts `pulseBraced` separately from `pulseAtBound`, publishes `siltContact.braced`, `braces`, `braceReleases`, `braceAnchor`, and preserves session-only Absorb pull reconciliation from D2K.

## Locked / forbidden
Movement speeds and 0.38–1.6 radial grip limits outside this limited brace; camera aiming/commit lock; old HC/LS1 version indices; material identity; eight-unit conservation; habitat cycle, Guide, atmosphere; nutrient absorption; regional completion/return fold; global verb routing; chemistry/rewards; Silt unmount release repair. No new areas, material transfer, force physics, persistent world deformation, or mandatory new progression gate.

## Manual acceptance (about 2 minutes)
1. Overlay on D2K and enter Silt garden. Start capture with **Alt+Shift+R**.
2. Lock a nearby grain LT+A, physically bring it into the amber-brown sediment patch. Look for **brighter turquoise ring/tether**, indicating BRACE.
3. While holding LT, slightly move the Core; the grain should remain positioned at the same contact point.
4. Pulse X twice without needing exact stick positioning. Look for **amber depression then pale-gold temporary imprint**.
5. Hold RT to withdraw: the brace should disengage, grain draw inward, and sediment relax.
6. Reacquire/release a grain; optional: leave Silt while holding a grain. No stale locked ID/ownership or mass change.
7. Stop capture with Alt+Shift+R, export with **Alt+Shift+E**, upload `BLOB_LS1D1D2L_OBSERVATION.json` plus your feel impressions.

## Test status / limitations
204 automated assertions passed: 41 dedicated D2L brace, 52 previous contact/visual, 27 D2K convergence, 46 D2I movement, 14 environmental route, 24 recorder/cycle. Three changed JavaScript files passed `node --check`; overlay ZIP integrity verified. Tests use genuine source methods plus stubbed Three vectors/materials, not a full Vite/WebGL run. Only user playtesting can establish feel and rendered visual clarity. No physics impulse, Core material intake, chemistry bond or gameplay progression credit is claimed.
