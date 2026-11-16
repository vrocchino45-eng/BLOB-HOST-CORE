# CONNECTION43 — shared Core / Hub / Comb family accents

Install over CONNECTION42. Extract into the project root, keeping CONNECTION43_PATCH intact, then run:

```powershell
node .\APPLY_CONNECTION43.mjs --check
node .\APPLY_CONNECTION43.mjs
```

Reload. Exact originals stay in CONNECTION43_BACKUP. Restore with `node .\APPLY_CONNECTION43.mjs --restore`; unknown later edits are protected. Existing gameplay controls, label controls and camera behavior remain as shipped.

## Family identity now follows a shared role

| Family | Shared color | Connected presentation |
|---|---|---|
| Grave | Violet `#B9A0BD` | Core identity accent, Hub primary gate/corridor accents, Comb traces and unselected Core label border |
| Vascular | Cyan `#78E3FF` | Core signal accent, Hub primary gate/corridor accents, Comb traces and unselected Core label border |
| Silt | Ochre `#C99D55` | Core return/pressure identity accent, Hub primary gate/corridor accents, Comb traces and unselected Core label border |
| Selection | Neutral `#F1EBD8` | Existing Core Work contour and selected Core label border |

The palette resolves known retained-family IDs, route IDs and Comb family names to the same values. Unknown IDs preserve a valid caller-supplied authored fallback. Unsupported fallback values use neutral text color rather than an invalid color.

Hub primary gate and corridor colors now follow the family; secondary tissue colors and backdrop albedo remain authored. Hub comparison leaves and backdrop emissive accents use the family role. Existing Core family constants now read the shared values without changing their prior numerical colors. Comb filter lobes, inherited-route imprints and return-fold accents use the same family palette instead of slightly different authored duplicates.

Temporary return-flow colors, nutrient colors, living-state tints and verb effects retain their existing roles. This pass does not force every pixel of an organ into a single hue. The broader regional tissue palettes and Vascular vessel-color discrepancy remain separate work.

## Background preference retained

The world remains visible during Core Work. No new background fading, world-ring suppression or transition-cue hiding is included. Morph readability, completion and second-morph rendering owners match CONNECTION42 exactly. Existing CONNECTION42 Core Work treatment is retained.

## Pass boundaries

| Field | Scope |
|---|---|
| Mode | Visual Lock / palette convergence |
| Purpose | Recognize the same family in the Core, Hub, Comb and labels |
| Allowed scope | Shared family resolver and five presentation-source bindings; bot catalog and prior-source fixtures |
| Locked systems | Background/ring visibility, topology and transforms, route behavior, physiology, repair, progression, camera, controls and audio |
| Delete / disable targets | Replace duplicated primary family accents; disable no systems or world elements |
| Visual target | Stable violet/cyan/ochre identity plus neutral selection across the connected presentation |
| Acceptance | Alias/fallback guards, actual material colors, independent materials, family labels, repeated Hub/Comb mounts |
| Regression | Prior-source Hub/Comb published-state parity, full quick suite, normal/trial label browsers, existing interruption scenario, installer and build |

## Repeat checks

```powershell
node .\BLOB_BOT_SERIES1\run.mjs --quick
node .\BLOB_BOT_SERIES1\run.mjs --case=X01
node .\BLOB_BOT_SERIES1\run.mjs --case=T02
node .\BLOB_BOT_SERIES1\run.mjs --case=S05
```

X01 checks actual Hub/Comb owners, 90 matched previous-source steps for each region, label descriptors, safe fallbacks and background cue retention. T02 adds neutral/family label checks and visits Vascular, Silt, Hub, Comb, Hub and Surface through explicit debug mounts. The existing browser setup is required. These fixtures do not establish naturally earned campaign progression, physical-controller feel or human color appearance.

For a focused visual review, compare the Core's retained families with their Hub spokes and Comb traces, then select another piece and change its body zone. Identity should remain recognizable while selection stays neutral. Lighting and translucency still affect screen appearance.

The Surface repair trial remains opt-in. Engine/world verb-hue reconciliation and the rest of the region palette migration remain future passes.
