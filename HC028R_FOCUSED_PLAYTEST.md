# HC-028R Focused Playtest — Regional Ecology Distribution

## Main question

Do the existing organisms now feel **distributed through a living Host**, or do repeated Watchers/Relays feel like copied props?

## Test route

1. **Surface Wake** — confirm the original Tender and Nursery Watcher still behave exactly as before. If Tender is bonded, keep it; its companion behavior should remain unchanged.
2. Travel **Hub → Vascular**. You should encounter a sparse sequence of **three Relays**, not one cluster. Interact with at least two separately. Their relationship memory/residue must remain independent.
3. Leave and re-enter Vascular. All three Relays should re-anchor relative to the new route entry instead of remaining at old world positions.
4. Travel **Hub → Silt**. One Relay should be present in the compressed route. It should inherit the Silt atmosphere/flow and feel more constrained without becoming a gate, objective or pickup.
5. Travel **Hub → Grave**. A regional Watcher should remain anchored near the memory bed. It may sample/recognize residue but must not chase the Core, protect a waypoint or claim Grave memory as loot.
6. Reach **Comb**. A Watcher and Relay should coexist. Interact with one long enough to create a residue, let the immediate response finish, then watch whether the other can recognize/answer that trace through the existing HC028O/P language.
7. Enter **Aperture Fields**. HC028R should add **no mounted organism population** there. Distant/open-field presentation remains the current source-authored boundary state.

## Population-specific regression checks

- Two Relays must not mirror one shared memory state after interacting with only one.
- A Watcher's own residue must be `self_trace`; another Watcher instance reading it must be `other_trace`.
- Cross-influence still cannot create another residue.
- No organism becomes a route key, waypoint, health target, loot source or objective requirement.
- No new HUD instruction should be required to understand the population.

## Existing regression checks

- Tender bond/repair unchanged.
- Original Nursery Watcher remains Nursery-bound despite its historical Signal Chorus cell reference.
- Hub deliberate route commits work.
- Comb entry does not immediately eject the player and can be re-entered.
- No `recipe is not defined` startup crash.
- Player movement/camera/chemistry behavior should match HC028Q.

## Acceptance feel

Target: **“I keep finding related living things in places where their function makes sense, and they can remember/respond independently.”**

Failure: **“The same prop was copied into four rooms.”** If recurrence feels repetitive, tune population count/placement/visual context in R1; do not add organism #4 before the Golden Host Slice.
