# CONNECTION38 — opt-in Core repair playtest

November 14, 2026. Baseline: CONNECTION36. This makes the CONNECTION37 comparison available through the actual registered Surface material owner. **Normal play keeps the existing rate.**

## Install

Extract into your project root beside src/public, keeping CONNECTION38_PATCH intact:

```powershell
node .\APPLY_CONNECTION38.mjs --check
node .\APPLY_CONNECTION38.mjs
```

Reload. Exact original files are saved in CONNECTION38_BACKUP. To undo: `node .\APPLY_CONNECTION38.mjs --restore`, then reload. The installer refuses unknown target/anchor edits and invalid payloads.

## Compare the two modes

Normal control:

http://127.0.0.1:5173/

Trial:

http://127.0.0.1:5173/?coreRepairTrial=1

Use your current port if different. If the URL already has query parameters, append `&coreRepairTrial=1`. Only the exact value 1 enables it. The trial appends **[Core repair trial]** to the tab title. Remove the parameter and reload to return to the control; no file restore is needed to switch modes.

The flag is fixed at startup. There is no new button, HUD panel, save unlock or normal-play bonus. The registered owner reads the trusted preceding-step Core capability only for the existing Surface scar plate's Stabilize repair. Other materials and regions retain their current behavior.

## Focused playtest

Try the same plate interaction in each mode. For the depth extremes, use the existing P debug anatomy availability command, F then G for Core Work, E to grab/place, Q to move inward or right mouse to move outward, and ArrowRight to select the next piece. Place all three Deep, return with F, aim at the plate, Pulse it several times and hold Q. Repeat with all three at Membrane. The existing controller mapping is unchanged.

P is a test shortcut, not earned route progression. Leave it out if you want to review only the Core you have naturally assembled; incomplete anatomy stays on the control rate.

Use roughly 5–8 minutes. Judge whether the plate's strain and rings agree, whether Deep feels steady rather than effortless, and whether Membrane's longer hold is interesting or merely slow. Then release, enter/leave inspection or Core Work, and revisit the region. Audio level, camera, movement and controls have not been retuned.

## Measured reference

From the supplied condition 0.9 at fresh reserve, the 60 Hz controlled comparison reaches coherence in about 2.87 s with the control; trial times are Deep 2.10 s, Inner 2.70 s, Membrane 4.27 s and Balanced 2.82 s. Your ordinary interaction need not start from exactly that condition or reserve. Longer holds also consume more of the existing reserve; no extra energy-cost formula was added.

This is an opt-in candidate for human feel review, not a default activation or a claim of full-campaign acceptance.
