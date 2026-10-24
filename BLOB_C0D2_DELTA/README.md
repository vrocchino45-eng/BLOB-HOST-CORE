# BLOB: HOST CORE — C0D2 / Grave Recovery Coupling

**Purpose:** first testable gameplay influence from the three-component circuit. Grave I uses *its own already-authenticated and retained Vascular-effect memory pressure* to modify only eligible Stabilize recovery. This is a small mathematical feedback pass, not a visual, material, locomotion, progression, chemistry, or remote-simulation pass.

## Prerequisite

Your project must have **C0D1-C installed** on top of C0D1-B/A + VIS1-B. If you have not installed C0D1-C yet, do so and complete its Windows build before this package. C0D2 refuses unexpected source versions. No need to copy over the whole game.

## Install (VS Code PowerShell, from project root)

Extract `BLOB_C0D2_DELTA` beside `src` and `package.json`. Run:

```powershell
node BLOB_C0D2_DELTA/apply.mjs --check
node BLOB_C0D2_DELTA/apply.mjs --apply
node BLOB_C0D2_DELTA/validate.mjs
npm run build
```

Preflight must say `C0D1C_READY`. If it reports `DIFFERENT` or `DEPENDENCY_DIFFERENT`, **stop and don't force the installation**. On success it says `C0D2 INSTALLED`. Repeating apply is safe. No browser proof is claimed by the offline validator.

Revert only if the files haven't subsequently been modified:

```powershell
node BLOB_C0D2_DELTA/apply.mjs --revert
```

Rollback returns to exact C0D1-C, retains prior Silt/Vascular/Host, and removes the C0D2 pure helper.

## Source ownership and mathematics

Exactly **two gameplay paths** are affected:

- `src/routes/GraveMemoryRouteSystem.js` (method-only guarded patch + independent sidecar): when Grave I is mounted, memory has been verified by C0D1-C, Silt has been read/stabilized, recoil/integrity still need repair, and the player actively holds Stabilize, existing recoil and integrity recovery rates are multiplied by `1 + 0.15 * memoryPressure`. The existing min/max clamps and safe thresholds are unchanged. The neutral multiplier is exactly 1.0 with no valid memory.
- `src/routes/GraveRecoveryCoupling.js` (new tiny pure helper): validates finite memory pressure, clamps it to `[0,1]` and applies a maximum 15% rate adjustment. It has no timer or cross-region scheduler.

Only the already-owned `frameState.graveVascularEffectMemory` sidecar gains `recoveryCoupling` diagnostics and `gameplayConsequenceApplied` true **only after an eligible assisted Stabilize recovery tick**. C0D1-C still owns the underlying memory receipt stream. Existing `frameState.graveMemoryRoute` objectives, stage contract, and route rules are preserved.

**Not changed:** risk inflicted by premature/protected Absorb, base recovery without history, range/duration of Stabilize, recipe data, memory accumulation, Silt grain movement, Vascular response, Host receipt validation, Grave II resonance, inputs, aim/targeting, physics, movement, visuals, saves, and progression. No grain or energy is claimed to arrive in Grave.

## Focused acceptance when ready

1. First install C0D1-C (if needed), install C0D2, validate and build.
2. **Clean comparison:** enter Grave I without having visited Vascular in that session. Read and stabilize the memory Silt; incur a recoverable residue recoil using the existing premature/protected Absorb risk interaction; then hold Stabilize to recover. The multiplier must remain **1.000**.
3. **Circuit comparison:** in a fresh session release a real Silt grain, visit Vascular without reloading so it responds, then enter Grave I. Incur the same Grave recoil and hold Stabilize. The multiplier should be between **1.000 and 1.150**, proportional to authenticated prior memory. The original objectives/thresholds must still apply.
4. Leave and re-enter Grave I: previously accepted events must not double-count. Visiting Grave without Vascular receipt must never increase the multiplier.
5. Grave II, Silt, and Vascular should behave exactly as before. Any regression in motion/targeting is grounds for rollback.

**Note:** existing REC1 recording may not automatically serialize the new Grave sidecar. The headless validator proves the code path, not browser perception. A focused test can be performed later once C0D1-C is verified on Windows; no new video is required for installation itself.

## Offline validation basis

- 51 assertions on a real event chain and real Grave I `updateInteractions()`/`publish()` methods with a minimal Vector3 stub.
- Separate clean vs. loaded recovery, zero/replay/forged/off-route/no-Stabilize/uncleared Silt negative controls.
- Source locks on Grave I and all upstream receipt owners, safe installer/rollback and deliberate divergence refusal.
- C0C2, C0C3, C0D1-A, C0D1-B and REC1 regressions were run successfully in the prepared source. The historical C0C4 owner hash test expects pre-C0D1-A source and is not a valid post-C0D1-A hash check; C0D1-A's parity validator passed instead.
- The archived C0D1-C validator demands the original Grave route hash and naturally won't pass after C0D2; C0D2 replaces that strict hash lock with its own updated contract checks.
- Production Vite build and browser gameplay were **not run in this environment** because dependencies are absent. Your `npm run build` establishes the Windows bundle check.
