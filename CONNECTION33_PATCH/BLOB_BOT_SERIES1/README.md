# BLOB: HOST CORE — Bot Series 1

Current: CONNECTION33. `plan.json` is the executable catalog; older counts and identities below remain historical. The current catalog has 26 quick cases / 503 checks and 19 browser scenarios.

Repeatable scripted regression bots for CONNECTION13 Core Work input coverage on CONNECTION12 gameplay, retaining prior identities and checks. This adds a separate test folder and reports; no production game file or existing package script is replaced.

## Run

Extract BLOB_BOT_SERIES1_SUITE.zip into your BLOB-HOST-CORE project root. You should have BLOB_BOT_SERIES1/run.mjs beside the existing src and public folders.

With your usual Node/project dependencies installed:

```powershell
node .\BLOB_BOT_SERIES1\run.mjs --quick
```

The quick run executes fifteen owner/contract cases with 293 checks. It needs the project's existing Three.js dependency and runs without a browser installation.

To enable the eight browser scenarios, install the suite's pinned test dependency into its own folder, then install its Chromium browser:

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

| W01 | Shipped coherence guards, provenance, mode/region and invalid data | 26 owner checks |
| W02 | Shipped current versus original law through actual movement/reserve | 28 groups including 192 paired motion scenarios |
| W03 | Actual Core publication, local response, movement outputs and F/G boundaries | Browser with declared prior-progress/placement/pose fixtures |

CONNECTION3 retains the original case identities and adds W01/W02/W03. Earlier RESULTS.md and packaged report directories remain historical evidence. Use each new summary's baseline, selected cases and source fingerprint for current results. `--case=W03` or `--case=B03` selects a single case; omitted cases are NOT_RUN. Browser workers have a 30-minute hard watchdog. Frame-scheduled test inputs do not advance game time or prove physical gamepad delivery.

CONNECTION5 adds W04 (14 particle continuity, lifecycle and exact physics-parity groups) and W05 (matched actual particle-position browser checks). At CONNECTION5, the quick total was 255 checks and the browser total was five scenarios. The particle phase uses existing <=50ms mounted simulation steps; ordinary render calls cannot advance it. Prior CONNECTION3 counts and reports above remain historical evidence.

Browser scenarios each count as one scenario in the machine summary; their many internal assertions are not represented as a separate assertion total. The CONNECTION5 quick count was 255 owner/contract checks; CONNECTION10 extends that to 261. plan.json is the exact executable case catalog.

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


## CONNECTION10 — consequence-loop coverage

Gameplay baseline remains CONNECTION5. Existing case IDs and historical results are retained. C01 adds the existing 18-check Silt → Vascular → Grave → Silt audit to the browser catalog as one scenario. C02 adds six owner groups including 32 matched topology/Host/signal/calm fixtures, positive-delta saturation, replay and invalid-provenance controls.

C01 uses normalized input and actual route/evaluator owners, with direct cell changes, supplied prior progress, contact poses and a near-resolution Grave II fixture. It does not earn an uninterrupted campaign. C02 supplies valid release decisions and prior Grave-return history to actual owners; it does not simulate material transactions or establish visual perception. Saturated causes may remain accepted while producing no new positive applied-effect record.

Current quick total: 261 checks. Current browser total: six scenarios. --all selects 20 catalog cases, totaling 267 summary checks when all pass. C01's 18 internal checks are included inside its one browser scenario, not added again to that machine-summary total.

Run one new case with `node BLOB_BOT_SERIES1/run.mjs --case=C01` or `--case=C02`. Use `--all` for closeout. Test-only consequence helpers stay inside this harness and are never imported by normal boot. No source, goal, reserve, receipt, material, controller or camera law changes are included.


## CONNECTION11 — portable gameplay-source identity

Each completed summary retains its original raw `sourceFingerprint` and byte-exact `productionFilesUnchanged` guard. It also includes `sourceIdentity`: a canonical sorted per-file SHA-256 manifest of src, public, package.json and index.html, plus `sourceIdentityUnchanged`.

The v1 policy normalizes CRLF to LF only in recognized UTF-8 text extensions. Binary bytes, whitespace, BOM and final newline remain significant. Full relative paths use forward slashes and code-point ordering. Source identity excludes the harness itself, node_modules, dist, runtime state, user performance and environment. It is not an event-authentication or dependency-reproducibility claim.

Compare current source against a completed new-format summary:

```powershell
node .\BLOB_BOT_SERIES1\compare-source.mjs --current .\CONNECTION11_EVIDENCE\quick\summary.json
```

Or compare two new summaries:

```powershell
node .\BLOB_BOT_SERIES1\compare-source.mjs .\run-a\summary.json .\run-b\summary.json
```

Exit 0 means equivalent under the declared policy; exit 1 lists changed/added/removed paths; exit 2 means missing, invalid or unsupported identity. Historical reports remain valid evidence of their original tests but cannot acquire a portable manifest retroactively from one raw aggregate hash. Preserve them; compare new-format reports going forward.

Self-check the utility with `node .\BLOB_BOT_SERIES1\check-source-identity.mjs`. Its eleven temporary-tree/runner controls are outside the catalog's 261 quick checks. The catalog remains 20 cases and six browser scenarios. Raw byte mutation still fails the runner even when the two portable identities agree.


## CONNECTION12 — territory Pulse freshness

L01 adds 32 owner checks across Silt, Vascular, Grave and Hub. L02 adds one running-browser scenario through actual InputSystem, Vascular unmount/remount and supplied Core Work context. A counter advance while another region is active cannot replay a local exploratory Pulse; a current canonical released-Pulse flag is also required. Fresh local releases, range checks and existing held Absorb/Stabilize reads are preserved.

Current catalog: 22 cases, 293 quick checks and seven browser scenarios; a full pass totals 300 machine-summary checks. Older counts above are checkpoint history. L02 uses a paused registry, manual bounded owner ticks, direct cell switches and near-site poses; it is not ordinary navigation or physical gamepad acceptance. No target permission, Host receipt, material, goal, reserve, current or control law changes are included.

The CONNECTION12 gameplay identity deliberately differs from CONNECTION11 in `src/world/RegionalTerritoryExpansion.js`. Comparing a current build with the historical CONNECTION11 example report should list that path. Compare new run summaries for the current baseline. New checks are selectable with `--case=L01` and `--case=L02`.


## CONNECTION13 — real Core Work placement inputs

K01 adds one browser scenario from actual keyboard/mouse through selection, grab, inward/outward depth, place, live chemistry, radial physiology and Vascular coherence. It moves all three retained pieces into Deep Core, then to membrane, using F/G, E, arrows, Q and right mouse. It does not assign piece offsets, counts, physiology, reserve or current factors.

The earlier returned-piece/four-credit checkpoint and in-current sampling pose are fixtures; this does not earn those pieces from zero. The test waits for the supplied checkpoint's actual four-credit publication before measuring, rather than changing registry order. Core Work suppresses world verbs/local coherence; world mode uses the resulting placement. Material mass, credits, architecture phase and accepted Host causes are preserved. Reserve samples are observed, not reset.

Current catalog: 23 cases, 293 quick checks and eight browser scenarios; a complete future pass totals 301 machine-summary checks. CONNECTION13 validation runs the quick catalog and K01 only. The prior 22-case/300-check full run remains CONNECTION12 evidence; it is not recounted as a fresh full run. K01 is selectable with `--case=K01`. Physical gamepad delivery and naturally earned campaigns remain separate evidence.


## CONNECTION15 — Hub readiness and phase-correct guidance

Convergence repair on CONNECTION14's consolidated CONNECTION13 harness / CONNECTION12 gameplay. U01 adds 31 actual-owner checks for candidate availability, boundary prerequisites, first invitation, commitment latch, Grave II guidance transitions and Core Work controls. U02 runs real keyboard E commitments with prior-history, near-body and forced-false screen-verification fixtures, followed by live Grave II Guide/HUD publication. It does not earn history from zero or establish physical controller delivery or human readability.

The catalog now contains 25 cases: 324 quick checks and nine browser scenarios (333 machine-summary checks if every case passes). Historical counts above remain checkpoint history. Select U01/U02 with --case=U01 / --case=U02. Source identity must be taken from each current run; the five changed production files deliberately differ from CONNECTION14.


## CONNECTION20 — consolidated integration checkpoint

Consolidates the CONNECTION15 Hub/guidance repair, CONNECTION17 Silt visibility, CONNECTION18 Stabilize contact presentation and CONNECTION19 Vascular arrival audio. Production gameplay is byte-for-byte CONNECTION19. The catalog remains 25 cases: 324 quick checks and nine browser scenarios (333 machine-summary checks for a passing full run). Root-level CONNECTION17/18/19 utilities provide additional declared owner and controlled browser checks; these are not silently counted as catalog cases.

The plan's baseline field remains its historical CONNECTION15 harness label. Use each run's portable source identity to identify actual production files. CONNECTION20 records a fresh full-catalog integration run. Historical results above remain evidence of their own checkpoints. Human controller delivery, in-motion readability, critical listening and naturally earned Core Work comparison remain separate acceptance.


## CONNECTION22 — late preparation cannot hide live Silt

R01 adds nine preparation-ownership checks, including expected reproduction on the exact old coordinator, success/failure guards and unchanged synchronous dormancy. R02 adds two running-browser race scenarios: actual registry/InputSystem Silt mount while an existing asynchronous shader job is delayed at a declared promise gate, followed by late success or failure and at least five normal callbacks. Assertions require a visible Silt root and drawable meshes as well as active actor/HUD; mass alone is insufficient.

The catalog now has 27 cases: 333 quick summary checks and ten browser cases (the browser cases total eleven summary checks), for 344 total summary checks if all pass. The current plan baseline label becomes CONNECTION22. Older labels and counts above remain checkpoint history. Select with --case=R01 and --case=R02. Controlled overlap is a fault-injection fixture, not a claim that every historical disappearance had this cause.

## CONNECTION23 — confirmed arrival

V01 adds eight owner checks; V02 checks the actual mounted fold wave and audio witness with declared Silt-decision fixtures. Catalog: 29 cases / 353 summary checks. Visual arrival now requires a Host-confirmed positive tissue effect and retires on unmount; received counts alone cannot restart it. The CONNECTION19 browser freshness assertion reads its audio witness, rather than requiring an old visual wave to resume on revisit. Human readability and listening remain separate.

## CONNECTION24 — presentation regression coverage

The existing CONNECTION17/18/19/21 checks are now catalog cases J01–J08: owner and browser coverage for Silt sightlines, Stabilize contact, confirmed arrival audio and Absorb progress. They retain their fixtures and assertions. Each test honors BLOB_BOT_REPORT after its dedicated report override, so the catalog can collect results without changing standalone use.

Catalog: 37 cases / 423 machine-summary checks (quick: 22 cases / 407 checks; browser: 15 cases / 16 checks). Production remains CONNECTION23; this coverage checkpoint changes no src/public files or gameplay. Current-source run reports, rather than case registration alone, establish which cases passed. Human perception, physical controller feel and natural playthrough acceptance remain separate.

## CONNECTION27 — Grave memory reply

E01 adds 23 owner/old-source parity/audio guards; E02 checks the actual mounted route's existing silt-memory echo and Web Audio graph. New sound and echo onset follow the memory owner's measured positive retention change, not raw receipt counts or recovery completion. Existing pressure/recovery/progression behavior is unchanged.

Catalog: 39 cases / 447 summary checks (quick: 23 cases / 430 checks; browser: 16 cases / 17 checks). Machine registration is separate from executed current-source evidence and human listening/readability acceptance. The BEFORE_MEMORY file is an exact old-source comparison fixture read by E01; gameplay never imports it.

## CONNECTION28 — measured Silt pressure reply

F01 adds 24 checks, including 72 exact old-source gameplay comparisons. F02 follows the existing C01 owner/evaluator/Host chain into actual completed-Silt pressure settling, then checks the published reply, existing rib materials and real spatial audio graph. Receipt consumption alone, incomplete Silt, failure and held bracing cannot announce applied relief.

Catalog: 41 cases / 472 summary checks (quick: 24 cases / 454 checks; browser: 17 cases / 18 checks). BEFORE_SILT is an exact old-source comparison fixture read only by F01, never imported by gameplay. Current-source execution and human perception remain separate from registration.

## CONNECTION30 — current-cell chemistry provenance

N01 adds 27 checks over all ten authored cells, freshness/schema/transition guards and matched Bond owner behavior. N02 verifies single registry placement before Bond, current-cell fields after debug mounts, actual input/commitment/boundary changes, late-frame neutral reads and a real session export. This is read-only authored context, not mutable Host metabolism or a new interaction modifier.

Catalog: 43 cases / 500 summary checks (quick: 25 cases / 481 checks; browser: 18 cases / 19 checks). Future consumers must call readLocalChemistryContext instead of trusting a raw snapshot's active bit. A boundary can change cells after the publisher's slot; guarded reads are neutral until the next sample. Session export uses the guard under developerTruth, with the existing v1.52 perceptual schema unchanged.

## CONNECTION33 — bounded Surface response restoration

Q01 adds 22 scoped-owner/lifecycle checks. Q02 uses actual Q/X/right-mouse input, normal targeting acquisition, registered condition/personality owners, release and debug Hub/Surface remounts on the visible Surface scar plate. Camera/player poses, deterministic registry steps, paused animation/preparation, and an earlier safe-material passage for the actual Listening Fold / Guide morph are declared fixtures. No relationship or condition is injected in Q02. Protected-seed lock and an actual optional nutrient absorption are checked separately.

J04 retains its original geometry/contact regression using a standalone unscoped condition fixture. The production registered owner is now restricted to the Surface plate, so the historical Grave geometry fixture no longer calls that scoped owner. Q02 is the current runtime integration proof.

No new chemistry coefficient or broader region response is enabled by this pass. Other seed/material/entity profiles remain outside the new production scope. Human feel and a naturally earned full campaign remain separate acceptance.
