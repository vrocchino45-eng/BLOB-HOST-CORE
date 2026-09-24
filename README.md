# HC031I1 — Contact Ecology Entry and Visual Readability Lock

HC031I1 fixes the focused test path exposed by cumulative HC031I telemetry. Shift+1 now lands directly above the central membrane inside contact range, and camera-forward movement follows the authored sequence instead of leaving it behind:

**teal membrane pressure wave → orange scar brace bands → amber residue yield / Stabilize hex**

The overlays are disabled for collision and targeting. They visualize existing contact, locomotion, projection, and Stabilize state without changing movement, controls, attachment rules, targeting, verb strength, progression, or ordinary playthrough behavior.

Use **Shift+1**, move camera-forward, and export with **Shift+T**. See `HC031I1_FOCUSED_PLAYTEST.md` for the exact visual checks.

---

# HC031I — Host Contact Ecology Continuation

HC031I is the first post-H3 environment/ecology pass. The H3 tendril/contact/brace architecture is treated as locked foundation. Surface Wake's Host Contact Shelf now continues into three linked Host material conditions: a living membrane causeway, a scar load buttress, and a weak residue wash.

The same controls and body grammar apply everywhere. The environment changes how that grammar is received:

**membrane carries → scar braces → residue yields**

`HostContactEcologyContinuationSystem` adds only presentation and bounded local ecological response. HC031I does not add movement to the crawlable continuation geometry; disabled response shells visualize carry/load/yield without moving planted world anchors. The original entry shelf keeps its pre-existing subtle breathing. No objective, gate, new ability, new button, targeting rule, movement owner, or progression authority is added.

Use **Shift+1** for the focused continuation test and **Shift+T** to export telemetry. See `HC031I_BUILD_REPORT.md` and `HC031I_FOCUSED_PLAYTEST.md`.

---

# HC031H3 — Brace Continuity

HC031H3 keeps the HC031G `Stabilize + Pulse = cohere_project` grammar unchanged and closes the final H2 consumer-lifetime mismatch. Live anchor-carried support remains the preferred external brace. If that support disappears briefly during a normal peel/replant while `PlayerMovementController` still owns a valid `authored_suction_support` attachment, Stabilized Projection now preserves external Host bracing through that same movement-owned continuity.

No new grace timer, movement tuning, ability, control, or surface rule is added. Free-space focused Pulse remains self-braced.

Runtime grammar:

**live anchor support → external brace**

**anchor handoff + retained authored suction attachment → continuity brace**

**no Host attachment → self brace**

See `HC031H3_BUILD_REPORT.md` and `HC031H3_FOCUSED_PLAYTEST.md`.

---

# HC031H2 — Anchor-Carried Surface Identity

HC031H2 closes the timing/identity handoff exposed by H1 telemetry. `CoreSurfaceTruthSystem` still decides whether a surface is authored and mechanically eligible, but once a sucker seals, that anchor carries the accepted surface relationship until peel/release. Support, movement attachment, and Stabilized Projection now read the retained anchor identity rather than requiring a second same-frame surface rediscovery.

Runtime grammar:

**SurfaceTruth authorizes seal → anchor carries surface identity → support plane → physical attachment/locomotion → optional external Stabilized Projection brace**

This remains on the experimental HC031H branch until telemetry proves sustained overlap.

---

## HC031H1 — Unified Physical Contact Authority

The experimental tendril branch now uses one physical-contact law: an explicitly authored crawlable surface plus a valid world-planted suction support is sufficient for `PlayerMovementController` to acknowledge attachment. The older Silt/membrane chemistry proof remains supported but no longer universally gates authored suction. HC031G focused-Pulse grammar is unchanged.

# HC-031H EXPERIMENTAL CHECKPOINT — Planted Contact Support Assimilation

HC031H is the first Git-era locomotion assimilation experiment. It keeps HC031G's **Stabilize + Pulse = `cohere_project`** grammar locked and changes only the physical support logic beneath suction locomotion.

The pass adapts four proven procedural-locomotion ideas into BLOB's existing three-tendril anatomy: world-planted contacts, strain-driven replant selection, predicted footholds in the surface tangent frame, and body ride height derived from the planted support plane.

Runtime grammar:

**authored crawlable surface -> world-planted suction anchors -> support plane -> ride-height/tangent refinement -> PlayerMovementController translation**

`CoreTendrilSupportPlaneSystem` is read-only. `CoreSurfaceTruthSystem` still decides what is crawlable, `CoreTendrilSurfaceContactSystem` still owns anchors, and `PlayerMovementController` remains the only translation owner. No open-source source file is copied into BLOB; the architecture is independently adapted from the MIT-licensed procedural-spider reference.

This checkpoint also expands telemetry so short playtests can finally confirm support count, support-plane quality, surface identity, and whether Stabilized Projection is self-braced or surface-braced.

See `HC031H_BUILD_REPORT.md` and `HC031H_FOCUSED_PLAYTEST.md`.

---

# HC-031G ACTIVE CHECKPOINT — Stabilized Projection / Focused Pulse V1

HC031G makes the existing **Stabilize + Pulse = `cohere_project`** chord the owner of focused Pulse everywhere.

The ability does **not** require an anchor point and does **not** require a retained target. In open space, the three locomotor tendrils form a temporary self-brace triad while the Pulse field narrows forward. If those same tendrils are already sealed to an authored Host surface, adhesion, load tolerance, anchor count, and Pulse transmission reinforce the same projection.

Runtime grammar:

**player-owned Stabilize + Pulse -> self-braced focused projection -> optional Host brace -> material-dependent force transfer**

The Host Contact Shelf remains the first comparison space. Scar carries recoil best, membrane provides stable support, soft tissue yields, and residue is weak. These are modifiers of one function, not ability gates.

Use **Shift+1** for the focused shelf comparison. See `HC031G_BUILD_REPORT.md` and `HC031G_FOCUSED_PLAYTEST.md`.

---

# HC-031F1B ACTIVE CHECKPOINT — Crawlable Surface Authority + Host Contact Shelf

HC031F1B retires the generic rule that any nearby visible mesh can become suction contact truth. The Core now recognizes only **explicitly authored ecological surfaces**.

The first testbed is the **Host Contact Shelf**, a continuation inside Surface Wake rather than a separate gated region. It contains four registered surface families:

- stable membrane
- scar brace
- soft tissue slope
- weak residue patch

Each surface publishes adhesion, load tolerance, compliance, and future verb-transmission values. Only adhesion/load tolerance affect locomotion in this pass; Pulse/Absorb/Stabilize output remains unchanged.

Runtime grammar:

**authored ecological surface -> shared point/normal/profile -> suction anchors + stand-off + tendril traction**

`PlayerMovementController` remains the sole translation authority. `CoreSurfaceTruthSystem` owns contact truth. `CrawlableSurfaceRegistry` owns the authored surface profile vocabulary. `CoreTendrilSurfaceContactSystem` remains the anchor/presentation owner.

Use **Shift+1** for the focused Host Contact Shelf test position.

See `HC031F1B_BUILD_REPORT.md` and `HC031F1B_FOCUSED_PLAYTEST.md`.

---

# HC-031F1A ACTIVE CHECKPOINT — Surface Truth + Pull Readability

HC031F1 proved that planted tendrils can contribute real attached movement. Its playtest also showed that the Core could follow the older authored ellipsoid while visibly intersecting a different foreground surface, and that movement could still read as continuous translation underneath the tendril animation.

HC031F1A establishes one local visible-surface truth for the attached slice:

**visible surface sample -> shared point/normal -> suction anchors + stand-off + tangent motion -> pulsed plant/load/pull/handoff**

`CoreSurfaceTruthSystem` publishes one bounded nearby visible mesh point/normal. `PlayerMovementController` remains the sole translation owner. `CoreTendrilSurfaceContactSystem` remains the anchor owner. `CoreEmbodimentSystem` only reflects the loaded anchor through deformation.

When no credible visible surface is available, the authored movement envelope remains the safe fallback. No new controls, colliders, navmesh, edge wrapping, targeting/Bond rules, Grave rules, combat rules, or progression authority are introduced.

The acceptance question is now very concrete: **does the Core crawl along the surface you can actually see, with each visible tendril plant causing a readable body pull?**

See `HC031F1A_BUILD_REPORT.md` and `HC031F1A_FOCUSED_PLAYTEST.md`.
