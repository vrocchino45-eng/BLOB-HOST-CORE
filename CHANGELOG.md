# Changelog

## HC031H — Planted Contact Support Assimilation

- Added read-only support-plane derivation from planted suction anchors.
- Replant selection now chooses the actually over-strained support, with deterministic tie-breaking.
- New footholds are predicted slightly ahead in the authored surface tangent frame and remain world-fixed through the reach.
- Attached ride height and tangent refinement can use the planted support plane while movement authority remains unchanged.
- Core contact presentation can conform to the support plane.
- Session telemetry now records support-plane and stabilized-projection brace state.
- HC031G verb grammar and surface ecology remain locked.

## HC031G — Stabilized Projection / Focused Pulse V1

- Kept HC029C `Stabilize + Pulse = cohere_project` as the semantic owner.
- Added free-space self-braced focused Pulse; no anchor and no retained target required.
- Reposed the same three locomotor tendrils into a counter-force triad during free focused projection.
- Added optional external bracing from authored ecological surfaces using adhesion, load tolerance, Pulse transmission, and sealed-anchor count.
- Added camera-forward directional material focus without changing TargetingSystem authority.
- Reduced ambient response while focused projection is active so concentration is physically readable.
- Added elongated forward Pulse presentation and stronger sealed-tendril load expression.
- Corrected Host Contact Shelf continuation language so anchoring enhances rather than unlocks the function.
- Kept controls, movement ownership, Bond, Grave, rupture, progression, and authored surface profile values locked.


## HC031F1B — Crawlable Surface Authority + Host Contact Shelf

- Retired generic visible-mesh contact eligibility.
- Added explicit `CrawlableSurfaceRegistry` metadata authority.
- Added the Host Contact Shelf as a Surface Wake continuation, not a new gated region.
- Authored stable membrane, scar brace, soft tissue, and weak residue surface profiles.
- Published adhesion, load tolerance, compliance, and future verb-transmission data.
- Let adhesion/load tolerance modestly affect the existing tendril locomotion traction.
- Retargeted existing Shift+1 debug test position to the shelf; no new control added.
- Kept Pulse/Absorb/Stabilize strength, targeting, Bond, Grave, rupture, progression, and Core growth locked.


## HC031F1A — Surface Truth + Pull Readability

- Added bounded local visible-mesh surface truth.
- Unified visible surface point/normal across stand-off, tangent movement, and suction anchors.
- Reduced attached direct thrust to 4%.
- Added stronger fresh-anchor load pulse and real no-forward-anchor hesitation.
- Tightened replant cadence.
- Added load-bearing tendril emphasis and bounded Core stretch toward the active anchor.
- Kept authored ellipsoid as fallback/safety envelope.
- No new controls, colliders, edge wrapping, targeting/Bond, Grave, combat, or progression behavior.

## HC031F1 — Attached Pull Prototype
- Converted surface tendrils from presentation-only contacts into a bounded locomotion request.
- Planted world-space anchors now provide support/load state to PlayerMovementController on the following frame.
- While tendril-driven, raw stick acceleration is reduced to 12%; most attached acceleration comes from the leading sealed anchor.
- Handoff/replant temporarily softens traction instead of stopping movement outright.
- Added anchored-rest damping so the Core settles instead of skating when input stops.
- Added ~0.30 world-unit attached stand-off from the trusted authored surface envelope.
- Kept free-space movement, controls, runtime ordering, targeting, Bond, Grave, rupture, and progression systems locked.

## HC031E2 — Unified Tendril Language
- Retired the legacy blue `player_seed_trailing_veil_*` cone meshes from the player Core.
- Replaced them with three free-space segmented tendrils using the same root/tendon/sucker family as HC031E1 surface contacts.
- Added one shared `core_suction_tendril_v1` material/proportion grammar for free and attached states.
- Added folded sucker tips during drift and per-index free/contact visual handoff so the Core reads as owning three limbs, not six.
- Kept PlayerMovementController, contact physics, controls, targeting, Bond, Grave systems, rupture and progression locked.

## HC-031C1 — Fragment Harvest Handoff

- Fixed rupture fragments being visually present but practically unavailable to Absorb because legacy Grave focus providers could continue to outrank them.
- Added a provider-level fragment focus override only while Absorb is held and live rupture fragments exist.
- Kept `TargetingSystem` unchanged; camera/distance scoring still chooses among fragments.
- Kept `BondSystem` unchanged; soft-bond completion still performs the actual absorb.
- Extended fragment capture windows so the existing relationship + bond sequence has time to complete while misses still cool into residue.
- Added telemetry/build identity v1.25.

## HC-031C2 — Fragment Field Capture
- Replaced fragment-only dependency on single-target soft-bond completion with a bounded spatial Absorb field.
- Added camera-aware debris selection with two concurrent pull channels.
- Added physical Core-contact collection and direct composition transfer for rupture fragments.
- Preserved intact-object BondSystem behavior and all Grave II octave/resonance/exit locks.
- Telemetry advanced to `blob.session.telemetry.v1.26`.


## HC-031D — Rupture Consequence
- Locked HC031C2 fragment field capture after controller confirmation that Absorb now functions.
- Added bounded material-specific aftermath from missed rupture debris.
- Fresh residue settles into a weaker persistent trace rather than disappearing.
- Grave II regional resonance reads the prior-frame aftermath as a small passive tendency.
- No cleanup gate, exit authority, route-progression authority, targeting authority, or new input.
- Telemetry advanced to `blob.session.telemetry.v1.27`.

## HC031E — Tendril Surface Contact Proof
- Added `CoreTendrilSurfaceContactSystem` with three procedural suction tendrils.
- Tendrils read only the trusted authored movement boundary/contact language.
- Added reach, flatten/seal, planted tension, one-at-a-time peel/reach/reseal, and release/recoil presentation.
- No movement force, collider, raycast, new control, progression, targeting, chemistry, rupture, or Grave ownership changes.

## HC031E1 — Suction Contact Readability
- Converged HC031E screenshots where suction pads read as floating ovals / body growths.
- Pad is now surface-planted and only appears as the reach arrives; it no longer rides on the free-space tip.
- Replaced spherical pad with a shallow sucker whose broad face terminates on the authored boundary.
- Added a quiet surface compression patch, stronger Core-side root, and more aggressive tendon taper/tension.
- Shortened ordinary attachment reach and made peel lift the tendon while the sucker remains planted until seal break.
- No locomotion, movement, collision, raycast, input, targeting, chemistry, combat, route or progression authority added.
