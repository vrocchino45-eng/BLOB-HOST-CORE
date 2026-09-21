# BLOB: HOST CORE — HC016P

## Mode
R1 PERFORMANCE REPAIR / PLAYABLE-ENDPOINT CLARITY.
No new gameplay.

## Confirmed Tight Camera cost
InspectionOcclusionSystem was doing expensive presentation work every Tight Camera frame:
- 18 corridor raycasts;
- each ray recursively intersected the entire scene hierarchy;
- an additional whole-scene traversal searched near-camera fadeable anatomy;
- another whole-scene traversal reduced nearby ambient density.

This explains why Tight Camera degrades most strongly in dense Surface/Guide/Hub anatomy but behaves better in relatively open Comb space.

## HC016P repair
Tight-camera occlusion now:
- caches exact eligible mesh candidates;
- refreshes that cache every 0.65 seconds;
- samples the expensive occlusion solve every 0.075 seconds;
- uses 10 corridor probes rather than 18;
- raycasts the cached exact mesh list with recursive traversal disabled;
- reuses the cached ambient list instead of traversing the whole scene again.

Marker animation and camera movement remain per-frame. This is a presentation-cost optimization only.

## Membrane Ridge finding
The screenshots are not showing a broken Ridge progression state.

When the HUD/Guide say the Ridge has yielded its pressure reading, `MembraneRidgeGameplaySystem.completed` is true. The only authored content beyond it in the current build is `gathering_ground_cluster`, and ApertureFieldsArrivalSystem explicitly defines that as a distant ecology landmark with no gameplay yet.

HC016P therefore does not fabricate a new transition or objective. The HUD and Guide now explicitly say **CURRENT PLAYABLE ENDPOINT** once the Ridge reading is complete.

## Locked systems
- normal camera behavior;
- movement;
- chemistry;
- route history;
- morph ownership;
- Grave/Vascular/Silt/Comb;
- Aperture/Signal Plain gameplay;
- debug jump.

## Acceptance
1. Normal camera remains smooth.
2. Tight Camera in early dense Host spaces is materially smoother.
3. Comb camera behavior does not regress.
4. Membrane Ridge can still complete normally.
5. Completion clearly reads as the current playable endpoint rather than an unexplained blocker.
