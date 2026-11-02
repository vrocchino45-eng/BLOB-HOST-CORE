# BLOB — BOT1-D11B-LIVE — Controlled Attachment Proof

**Purpose:** Finish D11B's live evidence gate before any LS1 surface-network expansion. This package adds *only four new Python scripts* under the existing `BLOB_BOT1_REAL_INPUT_HARNESS/scripts/` directory. It does **not** modify the game or rerun `D11B_APPLY.py`.

## Current source / evidence baseline

- Your last screenshots show the D11B authored surface validator **PASS** and both Silt LS1A validators **PASS**.
- The old HC031F1B validator fails on a historical `root.name` string from an earlier version; it is **not** evidence that D11B attachment fails. Do not mutate gameplay to satisfy it.
- The new shelf's authored center is `(-0.18, -0.75, -2.65)`, debug entry is `Shift+6` at `(0,0,0)`, and `CoreSurfaceTruthSystem` publishes `mechanicalEligible` only at a sampled hit distance <= 0.78. The contact probe extends 1.28 units.
- D11A was recorded before the new shelf existed. When the new referee is run on those old records it finds **zero target latches in all four runs**, as expected. A player approaching the shelf's future location without the surface does not prove anything about the patched runtime.

## Install — in local `BLOB-HOST-CORE` (C: GitHub root)

Place `BLOB_BOT1_D11B_LIVE_PROOF_TEST_ONLY_DELTA.zip` in the local project root. Open VS Code PowerShell *in that root*:

```powershell
Expand-Archive -LiteralPath '.\BLOB_BOT1_D11B_LIVE_PROOF_TEST_ONLY_DELTA.zip' -DestinationPath '.' -Force
py .\BLOB_BOT1_REAL_INPUT_HARNESS\scripts\test_bot1d11b_live.py
```

Expected: `Ran 15 tests` / `OK`.

**Do not** run `D11B_APPLY.py --apply` again. The patch is already installed. No JSON reference files or manual copy operations are needed.

## Live capture

With your Vite server running at `http://127.0.0.1:5173`, run:

```powershell
py .\BLOB_BOT1_REAL_INPUT_HARNESS\scripts\bot1d11b_live_browser.py --browser-channel chrome --headed --profiles host_positive,silt_short,silt_slow,silt_return --seconds 75 --output BOT1D11B_LIVE_RESULTS
```

The profiles use only existing debug shortcuts and normal keyboard input:

| Profile | Debug entry | Intent |
|---|---|---|
| `host_positive` | `Shift+1` | Known HC Host Contact Shelf as a positive-control attempt; short forward, settle, reverse |
| `silt_short` | `Shift+6` | Short forward approach to new shelf, neutral settle, reverse |
| `silt_slow` | `Shift+6` | Two shorter approach increments with a pause, neutral settle, reverse |
| `silt_return` | `Shift+6` | Longer approach, settle, reverse |

**These are probes, not guaranteed attachment trajectories.** The old scripted paths overshot the shelf. This group deliberately uses shorter input windows. No bot consults hidden owner state during the run.

## Offline referee + upload

```powershell
py .\BLOB_BOT1_REAL_INPUT_HARNESS\scripts\analyze_bot1d11b_live.py BOT1D11B_LIVE_RESULTS
Compress-Archive -Path '.\BOT1D11B_LIVE_RESULTS\*' -DestinationPath '.\BOT1D11B_LIVE_RESULTS.zip' -Force
```

Upload `BOT1D11B_LIVE_RESULTS.zip`.

The report uses `playerAttachment.active` + matching `ownerSurfaceId` in independently recorded REC1 owner samples. It treats the following outcomes differently:

1. `SAMPLED_TARGET_LATCH_AND_RELEASE` — matching surface attached then released in sampled owner records. Good evidence for this controlled route, but not proof a particular key caused release.
2. `SAMPLED_TARGET_LATCH_RELEASE_UNVERIFIED` — matching latch, no sampled release.
3. `TARGET_LATCH_NOT_OBSERVED_IN_SAMPLES` — **inconclusive for the mechanics**, not a release failure. Sampling and/or trajectory may have missed contact.
4. `EXPECTED_CELL_UNVERIFIED` / `CAPTURE_INCOMPLETE` — invalid evidence; repair capture first.

The independent Host control must be judged separately from Silt. A positive Host latch does **not** establish a Silt latch. The HUD phrase `Contact attached` is visual-contact language, never a substitute for a mechanical owner attachment.

### If all scripted Silt approaches remain inconclusive

Do **one** focused manual entry (use `Shift+6`), navigate gently around the **new authored sediment shelf**, wait on contact, then try moving deliberately away. Record REC1 with `Alt+Shift+R` to start/stop, and `Alt+Shift+E` to export. A 1–3 minute focused recording is enough. It may expose view-direction/targeting issues that a fixed bot route cannot resolve. Do not add more global colliders or change the movement controller without that evidence.

## Ownership and non-goals

- **Locked:** `PlayerMovementController`, `CoreSurfaceTruthSystem`, HC material profiles, LS1A visual-only geology, LS1B chemistry, Fold/Watcher, and D10B reference policies.
- **Changed:** New test-only Python files, no runtime source changes.
- **Not proven by this tool:** real-time contact-normal alignment; arbitrary-surface recovery; causal effect of reverse input; natural Hub→Silt traversal; long-term reliability; Host receipt progression.

Only when a true D11B `false → true → false` owner sequence is independently verified should the project plan larger authored connective surfaces for Silt's Reservoir, Garden, and Veins.
