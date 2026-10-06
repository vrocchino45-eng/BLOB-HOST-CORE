# HC-031W2A3 — Residency + Foundation — Apply Notes

Apply this changed-files-only overlay **after HC-031W2A2 — Transient Render Budget**. Do not apply it directly to an older W1/W2A/W2A1 tree. Keep a backup of the working project before overwriting files.

## What changes

- `RenderBudgetSystem` adds render-only local-cell residency. After the Scar Flow transition envelope has fully settled (~2.4 s / nursery fade ~95%), Surface Wake local-detail roots are omitted only during `renderer.render()` and restored immediately afterward. In Signal Chorus/Hub, prior Surface Wake and Scar Flow local-detail roots are omitted from rendering. Gameplay/state ownership is unchanged.
- `HubChamberFoundationSystem` caches named scene roots, stops doing whole-scene matrix walks for Hub readability, refreshes scene-graph enforcement every 0.25 s, and refreshes spatial readability proof every 0.12 s. Hub animation, route state, prompts, and presentation authority still update every frame.
- Frame Truth reports `optimizationPass: HC-031W2A3`, plus `residencyMode`, `residencyRootsCulled`, and Hub cadence metadata.
- The existing 50 ms simulation delta cap remains unchanged.

## Validate after copying

From the project root:

```powershell
node scripts/validateHC031W2A3ResidencyFoundation.mjs
node scripts/validateHC031W2A2TransientRenderBudget.mjs
node scripts/validateHC031W2A1CostReduction.mjs
node scripts/validateHC031W2AFrameTruth.mjs
node scripts/smokeHC031W1StabilizedAimLocalContact.mjs
```

Expected: all five commands pass.

## Next playtest

Restart Vite and hard refresh. Run about **90–120 seconds**, ideally Surface Wake → Scar Flow → Signal Chorus/Hub. No video is needed. Stay in Scar Flow for at least 3 seconds after arrival so the residency envelope can settle, then continue to Hub if the route allows it. Export with **Shift+T** and upload the JSON.

In the JSON, confirm:

- `developerTruth.frameTruth.optimizationPass = "HC-031W2A3"`
- Scar Flow windows eventually show `residencyMode = "scar_flow_after_surface_transition_envelope"` and `residencyRootsCulled > 0`
- Signal Chorus/Hub shows `residencyMode = "signal_chorus_hub_local_detail_only"`
- Scar Flow owner census no longer carries the large Surface Wake roots after the envelope settles
- `hubChamberFoundationSystem` timing and Signal Chorus registry cost improve relative to W2A2

## Rollback

Restore the six modified files from your W2A2 backup and delete `scripts/validateHC031W2A3ResidencyFoundation.mjs`. There are no runtime delete targets.
