# HC023B — Surface Living States

## Result

HC023B turns existing nursery values into readable living situations. It does not add another state manager. `SurfaceWakeGameplaySystem` remains the sole gameplay owner, while `SurfaceWakeEcologicalCausalitySystem` and `AmbientMaterialInteractionSystem` remain presentation observers.

## State grammar

| State | Existing cause | Existing-body response | Duration role |
|---|---|---|---|
| Cautious | Baseline trust/integrity | Held asymmetry, quiet Watcher | Default |
| Blooming | Recent authored Tender feeding | Canopies and fronds open; green-gold lift | 3.4-second response beat |
| Panic | Unsafe outcome or agitated scar contact | Clamped tall silhouette, warning ring, scattered/reversed field | 4.8-second response beat or contact-driven |
| Withered | Integrity ≤ 0.52 or scar load ≥ 0.58 | Contracted anatomy, dim sparse drift | Persists until repaired |
| Embrace | One feeding plus healthy trust/integrity and open material passage | Wide sheltering canopy, calm inward field | Stable relational state |
| Growth | Two feedings plus strong trust/integrity | Larger persistent canopy and longer fronds | Optional persistent consequence |

## Choice consequence

Clean absorption into the Core still counts as nourishment and can open the material passage. It now also removes a small amount of Tender integrity and trust. Repeating that choice can wither the nursery. Unsafe absorption additionally raises local scar load. Feeding the Tender repairs integrity and scar load, so all negative states remain recoverable.

## Density contribution

The mandatory route remains one safe authored cycle. Players who continue observing can see Bloom settle into Embrace, pursue a second feeding to reach Growth, or discover and repair Panic/Withered states. This adds authored curiosity rather than mandatory delay and is intended to help the 22-minute route support a longer exploratory run toward 30 minutes across later density passes.

## Visual/performance scope

- No new geometry is created for the state pass.
- No new raycast, particle field, entity, or draw-call owner is introduced.
- The Tender's existing child meshes change scale/material response.
- The existing Watcher ring, signal filaments, scar emissive response, 30 Surface volume motes, and 66 ambient motes carry the state outward.
- Host rhythm remains the sole macro timing authority.

## Scale-dependent tendril direction

The current small Core remains a limbless sphere with short sensory/interaction filaments. In later, larger structures, mature tendrils may become temporary functional anatomy: planting as feet, pulling or bracing during traversal, climbing, and suctioning to Host surfaces. They should grow from chemistry/composition, retract when unnecessary, and avoid resolving into a permanent humanoid body. This is design authority for a later pass, not runtime scope in HC023B.

## Verification

- HC023B state-contract validator: pass.
- HC023A platform/reachability validator: pass after identity-aware successor update.
- Undefined `this.method()` audit: pass.
- Production build: not rerun successfully because the package gateway could not supply the missing Vite dependency (`tinyglobby`, HTTP 502).
