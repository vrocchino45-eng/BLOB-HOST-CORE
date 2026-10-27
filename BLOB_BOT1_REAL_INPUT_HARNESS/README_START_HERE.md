# BLOB — BOT1-A Real Browser Input Harness
**Milestone:** HIERARCHY-01 / G1 BOT1-A | **Status:** Harness implemented; real-game acceptance PENDING

BOT0 drove pure state functions. BOT1-A opens your running game in Chromium/Chrome/Edge, sends actual browser keyboard and mouse events into the existing `InputSystem`, reads on-screen HUD text for action selection, and captures owner evidence with the existing REC1 recorder. **There are NO gameplay changes, no artificial objective completions, no injected position/target IDs, no special movement powers, and no altered material ledger.**

## Run on Windows
From your game project root, with the same C0E3 or newer build you intend to test:

```powershell
py -m pip install playwright
py BLOB_BOT1_REAL_INPUT_HARNESS/scripts/validate_bot1_contract.py --project .
```

In a **separate terminal**, start your normal game server:

```powershell
npm run dev
```

Check the address printed by Vite (typically `http://127.0.0.1:5173`). Then, in the original terminal:

```powershell
# One short installation smoke run. Chrome must be installed for this example.
py BLOB_BOT1_REAL_INPUT_HARNESS/scripts/bot1_browser.py --url http://127.0.0.1:5173 --browser-channel chrome --profiles reader --seeds 11 --duration 25 --output BOT1_RESULTS

# Full G1 candidate matrix: 3 profiles x 3 seeds, 90 s each, plus one 4-min attempt.
py BLOB_BOT1_REAL_INPUT_HARNESS/scripts/bot1_browser.py --url http://127.0.0.1:5173 --browser-channel chrome --profiles explorer,reader,stress --seeds 11,23,47 --duration 90 --route-duration 240 --output BOT1_RESULTS

py BLOB_BOT1_REAL_INPUT_HARNESS/scripts/analyze_bot1.py BOT1_RESULTS
```

If you have Edge rather than Chrome, substitute `--browser-channel msedge`. If neither browser channel is available, `py -m playwright install chromium` followed by running without `--browser-channel`. Optional: `--headed` for a visible browser (also helpful when headless WebGL is unavailable). This *opens its own browser context*, it does not take over your existing play session.

## What the runner does
- **Explorer**: seeded roaming, intermittent Guide focus and Interact; no target ID, coordinate, route shortcut or owner truth for navigation.
- **Reader**: uses the *visible HUD text only* to choose steering and Pulse/Absorb/Stabilize attempts; it does not understand the 3D pixels. No authoritative result is fed back into its decisions.
- **Stress**: applies actual input chords, short pulses, opposing movement, and rapid repeated actions to search for false positives and boundary weakness.

Each run creates `RUN.json` (the actual attempted inputs, HUD text, and read-only referee snapshots), `REC1.json` (the genuine owner recorder download), and start/middle/end PNGs. `BOT1_RUN_INDEX.json` and `BOT1_ANALYSIS.md` summarize the runs. Repeated runs use distinct timestamped folders to avoid stale evidence.

## Why this is only BOT1-A
A runner that reads HUD text but cannot interpret scene pixels may fail to steer to a target visible on-screen. That is a **limited agent**, not proof the target is unreachable. The project still needs a vision-guided agent or a human field test for full BOT1 acceptance, plus explicit owner acknowledgement to grade intentional individual verb rejection/acceptance. Screenshots are captured for subsequent review, but the runner itself does not interpret them.

The runner never counts a mere button press as accepted physical force, never treats tissue transmission as grain movement, and never labels a visual wave as a Host receipt. Production proof comes from source-owner events in REC1.

### Stop / triage
Stop at any runtime exception, missing REC1, unexpected Host receipt, repeated boundary stalls, confusing HUD result, or controller input not matching the claimed action. When blocked, preserve all screenshots and JSON and mark **FAIL / AMBIGUOUS / UNEXERCISED**, never invent success.

### Reversion and file safety
This package contains new files only. Delete `BLOB_BOT1_REAL_INPUT_HARNESS` to uninstall. It does not overwrite existing `src` or `scripts` files. `BOT1_RESULTS` is test output; keep it for comparison or delete separately. Do not upload personal browser session/profile information.
