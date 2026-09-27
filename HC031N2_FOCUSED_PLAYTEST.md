# HC-031N2 Focused Playtest — Reacquire Closure

Run approximately **4–6 minutes**. Do not search for the next region in this pass.

## Primary sequence
1. Acquire a target while on/near the Host contact shelf.
2. Attach to a crawlable support.
3. Travel briefly on the surface.
4. Use Stabilize + Pulse or Stabilize + Absorb until you get a readable world response.
5. Deliberately peel away with away input.
6. Do **not** immediately fall back onto the exact surface you left.
7. Move onto a visibly different crawlable support (for example scar → membrane, membrane → residue, etc.).
8. Confirm the Core can attach there after the short cooldown.
9. Interact again after re-entry.
10. Export telemetry with **Shift+T**.

## Expected feel
- The surface you deliberately left should not instantly recapture you.
- A different valid Host support should not remain globally forbidden because of the old surface.
- Re-entry should feel like moving from one part of the older Host Core's anatomy/instrument to another.

## Telemetry expectations
Build: `HC-031N2`
Schema: `blob.session.telemetry.v1.36`

Look for:
- `movement.surface_reacquire_unblocked`
- developer reason `different_surface_after_deliberate_peel`
- different `fromSurfaceId` / `toSurfaceId`
- `validation.physical_language.stage_reached` → `reacquired_contact`
- ideally `validation.physical_language.chain_completed`

## Regression checks
- Immediate snap-back to the same release surface should still be blocked.
- Normal landing/crawling before a peel should feel like K/K1/L.
- Target ownership and verb combinations should feel unchanged.
- Forced/involuntary detach should not become sticky or auto-reattach.
