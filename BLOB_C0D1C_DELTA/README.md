# BLOB: HOST CORE — C0D1-C Grave I Vascular-Effect Memory

**Mode:** functional three-owner circuit completion: Grave I reads authenticated, already-applied Vascular effects from Host on its own mounted update. **No new visuals, progression, material transport, Grave II behavior, Core feedback, or off-route simulation.**

## Install in existing `BLOB-HOST-CORE`

Extract folder `BLOB_C0D1C_DELTA` alongside `src` and `package.json`. From the root in VS Code PowerShell:

```powershell
node BLOB_C0D1C_DELTA/apply.mjs --check
node BLOB_C0D1C_DELTA/apply.mjs --apply
node BLOB_C0D1C_DELTA/validate.mjs
npm run build
```

Preflight must say `C0D1B_READY`. If `DIFFERENT` or `DEPENDENCY_DIFFERENT`, **do not force** or manually copy files. The installer requires exact C0D1-B Host/Vascular/receiver source, exact old Grave I and GameRuntime source, and that the new helper is absent; it backs up changed old sources. Re-running apply is idempotent after successful installation.

Rollback if files remain unchanged since installing:

```powershell
node BLOB_C0D1C_DELTA/apply.mjs --revert
```

Rollback restores Grave I and GameRuntime exactly and removes only the C0D1-C new helper; C0D1-A/B and VIS1-B remain in place. The guarded installer deliberately refuses divergent files. The validation performs actual Silt → Vascular → Host → Grave I event tests, isolated Grave owner/mount tests with a minimal Vector3 stub, caps, duplicate suppression, malformed event rejection and no-off-route checks. **It is not a complete browser/Three.js build or visual playtest.**

## Gameplay scope

Three changed gameplay paths:

- `src/routes/GraveVascularEffectMemory.js` (**new**) — bounded Grave-owned memory for observed applied Vascular load changes, deduplicated across Grave remounts, with immutable receipts and sequence-gap rejection.
- `src/routes/GraveMemoryRouteSystem.js` — mounted-only read from the existing authenticated Host `forGrave()` channel. Publishes a **new independent sidecar** `frameState.graveVascularEffectMemory`, leaving existing `frameState.graveMemoryRoute` objectives/stages unchanged.
- `src/core/GameRuntime.js` — injects the existing Host ledger into first-visit Grave; no global scheduler or additional off-route update.

A Silt release alone does not establish Grave memory. Vascular must have legitimately accepted the Silt provenance and applied a positive local load change, then Host must accept the resulting effect. Grave retains the magnitude of the effect as a bounded 0..1 *memory pressure*, separate from real Silt matter and Vascular membrane load. It does **not yet** modify Grave interactions. That eligible consequence is **C0D2**, after three-link verification.

**Known boundary:** a Grave first visit after the Host bounded history has already pruned unseen event sequences rejects gaps instead of fabricating continuity. The system does not persist through browser reload. Existing recorder JSON does not automatically include the new Grave sidecar; field diagnostics require browser observation / a later recorder-facing pass.

## Focused test (after Windows build)

1. Start a new session: enter Grave before Vascular — no upstream memory should be present.
2. In another session: deliberately release a free Silt grain, visit Vascular so its effect applies, then enter Grave I without reloading. `frameState.graveVascularEffectMemory.receivedTotal` should be positive.
3. Leave and re-enter Grave I — count/memory pressure must not double. Grave's original puzzles and Grave II remain unchanged.
4. Record a short REC1 session if available; note that the existing recorder has no dedicated C0D1-C event capture yet.

No changes to camera, player movement, controls, target selection, chemistry, recipe, traversal or saves.
