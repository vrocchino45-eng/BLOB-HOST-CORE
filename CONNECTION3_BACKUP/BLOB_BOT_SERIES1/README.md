# BLOB: HOST CORE — Bot Series 1

Repeatable scripted regression bots for the current HOST-TRACE1 build. This adds a separate test folder and reports; no production game file or existing package script is replaced.

## Run

Extract BLOB_BOT_SERIES1_SUITE.zip into your BLOB-HOST-CORE project root. You should have BLOB_BOT_SERIES1/run.mjs beside the existing src and public folders.

With your usual Node/project dependencies installed:

```powershell
node .\BLOB_BOT_SERIES1\run.mjs --quick
```

The quick run executes ten owner/contract groups with 187 checks. It needs the project's existing Three.js dependency and runs without a browser installation.

To enable the three browser scenarios, install the suite's pinned test dependency into its own folder, then install its Chromium browser:

```powershell
npm install --prefix .\BLOB_BOT_SERIES1
node .\BLOB_BOT_SERIES1\node_modules\playwright\cli.js install chromium
node .\BLOB_BOT_SERIES1\run.mjs --all
```

This installs test dependencies inside the suite folder; it does not rewrite the game's package.json. Playwright 1.62.1 is pinned to the version exercised for this delivery. Vite comes from the existing project dependencies. Use the same Node environment that runs the current project.

Run only the browser scenarios with:

```powershell
node .\BLOB_BOT_SERIES1\run.mjs --browser
```

The runner starts a temporary local Vite server and isolated headless browser for each scenario. It does not operate your existing game tab. The server and browser close after the scenario. No screenshots are generated.

## Cases

| ID | Coverage | Type |
| --- | --- | --- |
| D01 | Full current/archive data and invalid Grave data | Actual loader/validator fixtures, 15 checks |
| M01 | Grip, imprint, seat, extraction, release and conserved material | Actual normalized-input owner loop, 9 checks |
| M02 | Core Work release classification and fresh reacquisition | Actual owner/mode fixtures, 8 checks |
| G01 | Vascular II send/receive, suspension and duplicate protection | Actual goal/credit owners, 14 checks |
| G02 | Stale, mixed-grain, hidden, invalid-ownership goal receipts | Synthetic observer negatives, 13 checks |
| G03 | Grave II evaluator plus Vascular/Silt owners reach six credits | Controlled owner integration, 14 checks |
| H01 | Host profile, cycle, local flow, hidden/remount and no passive credit | Actual Host/Vascular owner fixtures, 34 checks |
| H02 | Six episodes recover to a neutral twin | One long-run owner comparison over 240 active seconds |
| T01 | Host trace sampling, bounds, export boundary and non-mutation | Observer/export fixtures, 10 checks |
| P01 | Three-phase parity, earned-six reserve, debug exclusion, boost and empty reserve | Actual reserve/credit comparisons, 69 checks |
| B01 | Host cycle without input/clock injection; real Shift+T export | Running browser scenario |
| B02 | Real grip/imprint → F/G Core Work → world → same-grain reacquisition | Running browser with declared prior-progress/contact poses |
| B03 | Actual Vascular II and Silt II publications, six-phase, keyboard Hub return, reserve/mode follow-up | Running browser with declared earlier four-credit and contact/source fixtures |

Browser scenarios each count as one scenario in the machine summary; their many internal assertions are not represented as a separate assertion total. The quick count is 187 owner/contract checks. plan.json is the exact executable case catalog.

The runner itself can be checked with `node .\BLOB_BOT_SERIES1\check-runner.mjs`. Its intentional failure controls run in a temporary miniature project and leave the game untouched.

## Reports and failure handling

Each invocation writes a new timestamped directory under BLOB_BOT_SERIES1/reports. reports/latest.json points to its summary. Each selected case has a JSON result and stdout/stderr log. Browser failures also attempt to save state diagnostics. The arc stores extra bounded navigation/result files. B01 retains the extracted Host diagnostic trace, not the full downloaded session.

PASS requires a zero exit code, no reported failed checks and at least the expected check count. FAIL includes timeouts, missing reports and failed assertions. BLOCKED identifies unavailable browser dependencies/launch. NOT_RUN means a case was excluded by the selected mode; a quick run does not pretend the browser tests passed. Failures or blocked cases return a nonzero runner exit code. A failed case does not stop the remaining selected cases.

The runner fingerprints src, public, the root package.json and index.html before/after. It fails the overall run if those production files change. Test reports, temporary Vite caches and optional dependencies inside this suite are outside that source check.

The packaged reports preserve the actual runs performed during delivery. Future runs create new directories and update only latest.json; older reports are kept.

## Evidence boundaries

These are deterministic scripts and controlled fixtures, not a free-exploring AI player. Owner cases exercise actual modules with declared prerequisite state. G02 intentionally uses synthetic receipts. B02 supplies first-return/revisit and contact/player/held-pose setup; buttons still cause the actual imprint and mode-release behavior. B03 supplies the earlier four-credit checkpoint and positions; the actual regional goal owners and native grain trajectory earn credits five/six and keyboard navigation reaches Hub.

None of these establishes an uninterrupted naturally earned campaign, physical gamepad event delivery, art quality or human readability. The Host cycle's normal-play feel acceptance remains open. No thresholds, goals, controls, material laws or source-history labels are weakened to make the bots pass.

Test-only starter modules are bundled under fixtures and never imported by normal boot. Historical baseline source files in that folder are read as comparison text; they are not alternate live systems. Runtime exposure is appended only to intercepted development main.js for the isolated browser session and ends at browser close.

## Scope

Mode: Convergence / automated regression. Milestone: protect the accepted connected six-credit slice and Host-cause proof with one rerunnable suite. Allowed scope: this separate harness folder and reports. Locked: all production files, controls, camera, rendering, audio, Guide, material/receipt/progression/reserve ownership and checkpoint history. Delete/disable targets: none. Visual/feel target: preserve the current game; bots do not grant human acceptance. Acceptance: selected groups/scenarios run, save honest reports, detect failures and leave production source unchanged.

This is an initial bot series. Broader from-zero exploration, long soak tests, physical-controller delivery and visual/perceptual judgments remain separate future scopes.

## Optional environment overrides

Advanced/CI runs can set BLOB_BOT_CHROMIUM_EXECUTABLE and JSON-array BLOB_BOT_CHROMIUM_ARGS for an existing Chromium executable. The delivery environment used its supplied Playwright and Chromium with these overrides. Normal local setup above uses Playwright's installed Chromium. The harness never requests elevated permissions, installs dependencies automatically or modifies gameplay to bypass missing tools.
