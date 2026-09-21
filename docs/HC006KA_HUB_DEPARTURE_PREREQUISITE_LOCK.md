# HC-006KA — Hub Departure Prerequisite Lock

## Problem

HC-006K introduced the required first Hub Status Page use, but the legacy Signal Chorus → Bloom Residue compatibility morph could still start before that Hub requirement was completed. This allowed the player to enter the Grave route while the Hub objective remained at 80%.

## Root cause

`GateSystem` treated the active Grave Memory route as available when the Hub foundation was readable, and `ThirdLocalCellMorphSystem` independently evaluated its older Signal Chorus readiness conditions without consulting the new Hub self-reading prerequisite.

## Repair

1. `GateSystem` now separates **readable** from **crossable**.
2. The Grave Memory route is readable once the Hub foundation is complete.
3. It becomes crossable only when `hub_read_route_gates.complete === true`.
4. `ThirdLocalCellMorphSystem` now independently enforces:
   - Hub foundation complete
   - first Hub Status Page use complete
5. Opening Status Page outside Hub does not satisfy the prerequisite.

## Locked systems

- Surface Wake interaction and handoff
- Guide Threshold traversal and settle repairs
- Hub presentation ownership
- Status Page read-only behavior
- Persistent tight camera
- Canonical controls
- Existing Grave route behavior after legitimate departure

## Forbidden scope

No new route content, no Grave encounter changes, no Vascular/Silt activation, no Comb Threshold, no Aperture Fields, no teleport, and no branch menu.
