# Changelog
## HC-031W — Controller / Targeting / Surface Interaction Audit
- Froze HC031V/U2.1 gameplay behavior and added read-only diagnostics for the controller → candidate → attention → relationship chain.
- Added LT analog value, right-stick magnitude, target scope/distance, and explicit detection of cases where Stabilize protects an older attention owner while deliberate RS aim exposes a different candidate.
- Added active-cell crawlable-surface coverage diagnostics sourced from `CoreSurfaceTruthSystem` / `CrawlableSurfaceRegistry`; no new surfaces are authored in W.
- Added an Aperture/Gathering Ground HUD audit line (`W CTL` + `SURF`) and telemetry events/samples for controller-targeting mismatch and surface capability.
- Locked targeting selection/relationship methods, InputSystem, movement, Gathering Ground ecology, and surface profiles against the accepted HC031V parent.
- Telemetry schema advanced to `blob.session.telemetry.v1.51`; package advanced to `0.31.53`.

## HC-031V — Living Response Readability / Telemetry Truth
- Locked accepted HC031U2.1 encounter timing, latch, interruption, rearm, recurrence, traversal, targeting, and movement mechanics.
- Added cycle-legible response signatures using the existing Watcher ring, relay packet/thread, Ridge Echo beads, and Matter Spill residue only; no new particles, lights, geometry families, or gameplay authority.
- Added `responseRead` publication and HUD `RESP` readout distinguishing first reads from known recurring answers.
- Added telemetry event `semantic.meaningful_response` so repeated understood ecology answers no longer masquerade as new information or `no_gain`.
- Added `meaningful_response` as a third attempt outcome and extended Gathering Ground attempt observation to 3.4 seconds so the accepted 2.4–2.8 second latched answers can be causally credited.
- Semantic churn now uses the most recent new-information or meaningful-known-response age while preserving information-gain accounting as a separate metric.
- Telemetry schema advanced to `blob.session.telemetry.v1.50`; package advanced to `0.31.52`.

## HC-031U2.1 — Gathering Ground Relationship Intent Latch
- Split reactive ecology into initiation intent vs sustained relationship state.
- Stabilize + Pulse now latches Watcher interrogation intent; anchored Stabilize can sustain the answer after Pulse releases.
- Stabilize + Absorb now latches Relay intake intent; flow-aligned Stabilize can sustain the answer after Absorb releases.
- Increased normal transition grace to 0.72s while retaining shorter departure/retarget interruption truth.
- Added intent-latch diagnostics to HUD and telemetry movement samples.
- Counted `cohere` as coherent ecology memory rather than pressure.
- Preserved U2 ambient pacing, six encounter identities, memory/recurrence architecture, and all T6 traversal/targeting owners.

# HC031U2 — Persistent Living Ecology + Encounter Pacing

- Kept the accepted HC031T6/U1 Aperture → Gathering Ground same-cell continuity locked.
- Retained the original six Gathering Ground encounter identities.
- Slowed ambient Watcher/relay reads so first arrival can be observed before the space resolves.
- Replaced same-frame reactive completion with sustained Watcher (2.4 s) and relay (2.8 s) answer phases.
- Added interruption + retry backoff when the chord breaks or the player leaves the local response body.
- Added release + cooldown rearming so understood relationships can answer again without becoming new encounter IDs.
- Recurrent reactive answers can propagate fresh Ridge Echo Return / Matter Spill Return cycles.
- Added persistent interaction-memory readout (`quiet_observer`, `coherent`, `guarded`).
- Added `LOOP`/`MEM` HUD truth and telemetry v1.48 recurrence/memory fields.
- Added deterministic six-profile bot convergence and U2 behavior smoke tests.

# HC031U1 — Gathering Ground Alive Startup Lifecycle Hotfix

- Fixed boot crash caused by constructing `GatheringGroundAliveSystem` during `createEntitySystems()` before `ApertureFieldsArrivalSystem` existed.
- Moved construction into `createFirstSliceArchitecture()` after Aperture arrival + adjacent-territory owners are created.
- Kept the strict constructor dependency assertion intact.
- No encounter, movement, targeting, traversal, chemistry, input, or telemetry-schema changes.

# HC031U — Gathering Ground Alive Pass 1

- Locks HC031T6 same-cell/no-teleport continuity and begins the first local ecology expansion.
- Adds one Gathering Ground Watcher and two exchange relays on the canonical Aperture anchor.
- Adds 3 encounter families x 2 encounters: ambient, reactive verb-chord, and cross-territory.
- Adds encounter telemetry and LIFE debug readout.
- Deduplicates Gathering Ground observation telemetry after OBS3 without changing Pulse presentation.

# HC031T6 — Adjacent Territory Runtime Mount Lock

- Added `apertureAdjacentTerritorySystem` to the canonical Aperture active-region runtime profile.
- Raised Aperture active update budget from 9 to 10 (6 shared + 4 local systems).
- Updated Aperture gameplay/presentation ownership metadata to include the adjacent-territory owner.
- Added a regression that exercises `ModeController -> firstSliceRuntimeMount.activeSystemIds -> SystemRegistry` and proves the adjacent-territory owner mounts/executes instead of being skipped.
- Preserved HC031T5 Ridge trace semantics, canonical Gathering Ground identity, PlayerMovementController, TargetingSystem, and telemetry schema v1.46.

# HC031J1 — Surface Detachment and Free-Movement Handoff

- Corrected the authored surface-normal sign used to interpret deliberate away input.
- Added a short suction-unloading peel before release while preserving neutral attachment and tangent crawl.
- Directed the release impulse away from the actual contact plane.
- Raised direct movement authority only during deliberate peel input.
- Blocked suction reacquisition until both the cooldown and measured surface clearance are satisfied.
- Added detachment, peel, clearance, and reacquisition telemetry plus discrete attachment events.
- Preserved HC031J contact symbols, controls, verbs, surface eligibility, targeting, routes, and progression.

# HC031J — Contact Verb Symbol Grammar Lock

- Added canonical contact glyphs for Pulse outward, Absorb inward, and Stabilize coherence.
- Composed chords display their primitive symbols together instead of inventing new controls or abilities.
- Limited glyphs to the currently resolved authored surface.
- Tightened presentation truth so attachment-dependent ecology cues require suction on that exact active surface.
- Added read-only symbol and attachment-surface telemetry.
- Preserved HC031I4 geometry, contact mechanics, verb output, targeting, movement, progression, and material response grammar.

# HC031I4 — Residue Contact Bridge Lock

- Overlapped the first continuation residue pad with the scar foot at a matching usable height.
- Overlapped the second residue pad with the first to preserve continuous surface contact.
- Kept the `residue_weak` profile and all contact, attachment, movement, input, targeting, and verb mechanics unchanged.
- Preserved HC031I3 proximity, open-attempt, confirmed-hex, and afterglow visual grammar.
- Added a changed-files-only delta package based on HC031I3.

# HC031I3 — Residue Attempt / Confirmation Lock

- Preserved the accepted HC031I2 membrane-first Shift+1 landing.
- Repositioned the continuation residue wash after scar on the measured positive-X/negative-Z travel line.
- Raised and thickened residue geometry without changing the locked `residue_weak` profile.
- Split residue presentation into proximity, open-hex attempt, actual yield, and closed-hex confirmed coherence.
- Prevented passive residue proximity from being mislabeled as a yield event.
- Added attempt count, attempt activity, interaction stage, and cue-surface telemetry.
- Kept all H3 contact mechanics and normal play authorities locked.

# HC031I2 — Entry Sequence and Residue Coherence Lock

- Shifted the focused landing from X `4.0` to `3.2` to compensate for the measured positive-X/negative-Z camera-forward path.
- Kept the Core within the same central membrane contact bed while separating first contact from the scar priority volume.
- Added a 1.2-second presentation-only residue coherence hold after a valid attached `cohere` event.
- Added explicit coherence trigger, visual hold, and cue-surface telemetry.
- Kept movement, contact eligibility, suction lifecycle, support plane, projection mechanics, controls, targeting, verbs, surface profiles, routes, objectives, and progression locked.

# HC031I1 — Contact Ecology Entry and Visual Readability Lock

- Moved the Shift+1 test landing to the central membrane within authored contact range.
- Mirrored the continuation along negative Z so default camera-forward movement enters membrane, scar, then residue.
- Added high-contrast presentation-only visual grammar: teal pressure wave, orange brace bands, amber residue hex/yield.
- Added immediate visual response to existing attachment, locomotion, stabilized projection, and Stabilize state while retaining decaying material memory.
- Added visual-cue strength and grammar telemetry.
- Kept all H3 contact mechanics, controls, targeting, verbs, surface profiles, routes, progression, and normal play locked.

# HC031I — Host Contact Ecology Continuation

- Extended Host Contact Shelf from the original four-surface proof into a ten-surface continuous membrane/scar/residue ecology slice.
- Added a living membrane causeway, scar load buttress, and weak residue wash with the existing authored crawlable-surface profiles.
- Added `HostContactEcologyContinuationSystem` after Stabilized Projection as presentation/bounded-local-ecology only.
- Added non-contact response shells so the Host can visibly carry load, brace recoil, or yield without moving the physical crawlable mesh.
- Added decaying local-imprint channels for membrane carry, scar brace, residue yield, and residue coherence; none own progression or regional history.
- Added telemetry for active ecology surface/role/response and local imprint.
- Locked PlayerMovementController, SurfaceTruth, tendril anchor/replant, support plane, H3 brace continuity, HC029C composition, targeting, Bond/Absorb, Grave, controls, and surface-profile values.

# HC031H3 — Brace Continuity

- Stabilized Projection now consumes the existing PlayerMovementController authored-suction continuity during brief tendril handoffs.
- Live anchor-carried support remains the first-priority brace source.
- Added no new grace timer and changed no locomotion tuning.
- Added explicit telemetry for live-anchor versus attachment-continuity brace source.
- Free-space self-braced `cohere_project` remains unchanged.
- HC029C verb grammar, targeting, Bond, controls, SurfaceTruth, support-plane logic, routes, and progression remain locked.

# HC031H2 — Anchor-Carried Surface Identity

- SurfaceTruth now authorizes each suction relationship at seal time; the sealed anchor retains surface ID/profile/material/normal until peel/release.
- Support-plane derivation no longer requires same-frame surface rediscovery after a valid seal.
- PlayerMovementController consumes the anchor-carried support plane as authored suction authority.
- Stabilized Projection can use the same retained support relationship for external Host bracing.
- Added explicit carried-surface/support-source telemetry for the H1 mismatch.
- HC029C verb grammar remains unchanged; no new control, ability, collider, raycast owner, or physics dependency.

# HC031H1 — Unified Physical Contact Authority

- Authored crawlable surface + sealed suction support can now establish physical attachment without the legacy Silt membrane gate.
- Support-plane activation no longer waits for movement attachment to already be active.
- Legacy chemistry attachment remains supported as a fallback/modifier.
- Added explicit contact-authority telemetry for the HC031H finding.
- HC031G Stabilized Projection and HC029C verb grammar remain locked.

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
