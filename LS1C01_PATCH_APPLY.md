# LS1C0.1 — World-Anchored Living HUD — Apply

**Required starting point:** Current working **LS1C0 Universal Quick Look Inspector** build, itself layered over LS1B/LS1A2. HXP2A1 can remain installed. This patch is **incremental**, **not** a standalone game or complete repository.

1. Commit/back up the working BLOB project in GitHub Desktop.
2. Unzip outside the project directory.
3. Merge the patch `src` and `scripts` folders **into the project root**, replacing matching files. **Do not delete existing `src`, `scripts`, `public`, or other folders.**
4. Launch as before with `npm run dev` on your Windows setup. Refresh the game browser.
5. Press **F4** or hold **LB + RB ~0.6 sec** to enable/disable Quick Look. The world dims slightly and a small group of actual scene-anchored bubbles appears. To expand the original detailed design report, click **DESIGN NOTES** at the lower right or use **Shift+F4** while Quick Look is open. The next F4 closes the entire mode.

## Exact changed files
- `src/ui/QuickLookInspectorSystem.js`: World-projected labels, reduced world-view muting, detail-toggle report, bounded visibility, connector lines; retains the existing read-only snapshot.
- `src/core/GameRuntime.js`: Passes actual camera/Core/Silt/target providers to existing inspector; updates label positions **once per rendered frame after camera update**.
- `scripts/validateLS1C01WorldAnchoredLivingHud.mjs`: New projection/scene state/regression test.

No geometry, materials, Vite configuration, input map, or progression files changed. **Do not use this patch over W2B3.1 or LS1B alone**; it extends LS1C0.

## Known limitations
- Only Core, already selected target, and first verified Silt-owned packet/habitat scene anchors are labeled. Generic scenery has no new raycast.
- Inside other regions, Core and true selected targets can be labeled; bespoke location descriptions are not yet authored.
- Labels project visible 3D anchor positions, but do **not** claim line-of-sight occlusion, physical contact, or measured visual fidelity.
- Detailed notes use click/Shift+F4; controller-only navigation of deep notes is not implemented yet. The existing controller enable/disable chord is unchanged.
- World muting is a low-cost CSS overlay, not a shader or actual scene-lighting change.
