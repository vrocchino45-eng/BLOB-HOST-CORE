# BLOB: HOST CORE — BOT1-D9X TEST-ONLY DELTA

**Starting archive:** `BLOB-HOST-CORE-BLOB-BOT0.zip` (provided October 30, 2026)

**Purpose:** Continue D9W without editing the game. Attempt a complete Listening Fold under three **bot input-policy seeds**, then independently certify Watcher acceptance, ordered owner Stage 1→5 completion, and keyboard/REC1 Pulse + Stabilize pairing. Host and Guide evidence remain independent, explicitly non-substitutable domains.

**No gameplay, player movement, camera, world geometry, Guide, Fold-owner, Host chemistry, or runtime recorder changes.** The delta installs **three new files only** in `BLOB_BOT1_REAL_INPUT_HARNESS/scripts/`. It does not replace older bot passes, nor touch HC/LS1 code. Baseline D9W evidence stays immutable.

### Important seed qualification

The existing BOT1 harness uses `seed` to choose browser **input actions**; `page.goto()` does not seed the game world. D9X's `11,13,24` therefore test **different scripted controller policies**, *not* deterministic world variants. Seed 13 uses the existing acquisition adjustment; seeds 11 and 24 differ in the sweep selection (`seed % 3`). Passing D9X does **not** prove game-world RNG robustness or human scene comprehension. The final referee states this explicitly.

### Install (Windows PowerShell at project root)

```powershell
Expand-Archive -LiteralPath '.\BLOB_BOT1_D9X_TEST_ONLY_DELTA.zip' -DestinationPath '.\BOT1D9X_EXTRACT' -Force
Copy-Item '.\BOT1D9X_EXTRACT\BLOB_BOT1_REAL_INPUT_HARNESS\scripts\*.py' '.\BLOB_BOT1_REAL_INPUT_HARNESS\scripts\' -Force
py .\BLOB_BOT1_REAL_INPUT_HARNESS\scripts\test_bot1d9x.py
```

All three filenames are new, so older D9W scripts should stay unchanged. The offline suite has 19 tests; the historical D9W replay test runs if `BOT1D9W_RESULTS` is present in this checkout, otherwise it is skipped.

Start the normal game server in a separate PowerShell terminal:

```powershell
npm run dev
```

Then launch the browser attempts (Chrome example, headed mode):

```powershell
py .\BLOB_BOT1_REAL_INPUT_HARNESS\scripts\bot1d9x_browser.py --url http://127.0.0.1:5173 --browser-channel chrome --headed --runs 3 --seeds 11,13,24 --seconds 170 --output BOT1D9X_RESULTS
```

The browser runner uses only visible HUD objective text, the precommitted D9T course, and keyboard actions. It captures REC1 after completing all actions. It does **not** use REC1, hidden world coordinates, Fold distances, or owner state to choose actions. Every attempt is retained; a failure is not silently retried or excluded.

After the browser run completes, referee it **offline**:

```powershell
py .\BLOB_BOT1_REAL_INPUT_HARNESS\scripts\analyze_bot1d9x.py BOT1D9X_RESULTS --seeds 11,13,24
Compress-Archive -Path '.\BOT1D9X_RESULTS\*' -DestinationPath '.\BOT1D9X_RESULTS.zip' -Force
```

Upload `BOT1D9X_RESULTS.zip` for review instead of the entire game.

### Evidence gates

- Three attempts, three distinct **policy** seeds; one D9W control policy and two different acquisition variations.
- Complete final REC1 export with zero dropped details and no runner errors.
- A true owner-accepted Watcher Pulse **before** Fold Stage 1; an authentic Fold invitation.
- Owner Stage 1/2/3/4/5 transitions in strict order, exact named stages; final `completed: true` and `progress: 1`.
- D9W owner-proven Stage 2 Pulse and Stage 3 Stabilize correlation, including the bot's logged actions.
- Public-HUD success text alone never certifies an owner result. Watcher proximity read never certifies a Host material transaction.
- Independent columns for Guide witness count and Host recorder events. No assertion that the Guide caused the Fold, or that Stage 5 is a Host receipt.

**Gate:** With complete evidence, the policy-seed 11 baseline must certify and at least one other seed must certify for a *partial* cross-policy proof. All three must certify for `CROSS_POLICY_STAGE5_ALL_PASSED`. Any incomplete capture yields `INCONCLUSIVE_INCOMPLETE_MATRIX`. No gameplay repairs are included.

### Tests already performed by the creator environment

- Full provided source ZIP inspected: 3,274 entries.
- Existing D9W offline suite rerun: 27 tests, 26 passing and one skipped for an optional separate historical D9V fixture.
- Existing D9W original three REC1 exports rerun through D9W referee: 3/3 certified.
- New D9X referee retrospectively checked against the provided D9W captures: two Seed-11 full Fold runs qualify; seed 13 acquisition-only is correctly **not** counted as complete Fold.
- D9X offline synthetic negative tests cover incomplete/misordered Stage 5, missing pulse witnesses, missing keyboard hold, stale HUD, rejected Watcher reads, and dropped recording.

**Unexecuted:** Live D9X browser run against Vite. The ZIP is a test package, not a claim that D9X has already passed.
