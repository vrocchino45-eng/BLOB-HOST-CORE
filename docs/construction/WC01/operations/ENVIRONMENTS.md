# VS Code and Codex environments

## Provision trade worktrees after approval

Preconditions are an approved and independently verified `baseline/wc01-admitted-v1` on GitHub, its recorded full SHA, and authorization for each trade. Read [release readiness](../manifests/design-release-status.json). Current work orders are held. P01's view-only scope and P02 can qualify first. P03 remains verification-only until its dependency closes.

Use a separate approved coordination clone with its own Git administration. The original dirty checkout is not a trade environment. The commands below start in the existing coordination folder and create the separate clone as a sibling. Set its local core.autocrlf to false so the published overlay bytes stay exact. The setting applies to its linked worktrees only. Set `$Pinned` to the approved full SHA. Verify the remote before fetching, which writes local objects and refs. Use unused paths and branch names. Stop after any nonzero unexpected result.

```powershell
$CoordinationClone = Join-Path (Split-Path (Get-Location).Path -Parent) 'BLOB-WC01-coordination'
git clone --no-checkout https://github.com/vrocchino45-eng/BLOB-HOST-CORE.git $CoordinationClone
Set-Location -LiteralPath $CoordinationClone
$Pinned = '<approved full baseline SHA>'
$BaselineRef = 'baseline/wc01-admitted-v1'
$TradeParent = Join-Path (Split-Path (Get-Location).Path -Parent) 'BLOB-WC01'
git config core.autocrlf false
git ls-remote --heads origin "refs/heads/$BaselineRef"
git fetch origin "refs/heads/${BaselineRef}:refs/remotes/origin/$BaselineRef"
if ((git rev-parse "refs/remotes/origin/$BaselineRef").Trim() -cne $Pinned) { throw 'Baseline SHA mismatch' }
New-Item -ItemType Directory -Force -Path $TradeParent | Out-Null
git worktree add -b trade/wc01-p01-shelf (Join-Path $TradeParent 'P01') $Pinned
git worktree add -b trade/wc01-p02-vascular (Join-Path $TradeParent 'P02') $Pinned
git worktree add -b trade/wc01-p03-hub (Join-Path $TradeParent 'P03') $Pinned
git worktree list --porcelain
foreach ($TradeId in @('P01', 'P02', 'P03')) {
  $TradeTree = Join-Path $TradeParent $TradeId
  node (Join-Path $TradeTree 'docs/construction/WC01/tools/verify-overlay.mjs') $TradeTree
  if ($LASTEXITCODE -ne 0) { throw "Invalid admitted overlay in $TradeTree" }
}
code --new-window (Join-Path $TradeParent 'P01')
code --new-window (Join-Path $TradeParent 'P02')
code --new-window (Join-Path $TradeParent 'P03')
```

Start a separate authorized Codex session from the corresponding VS Code window. Give it only that worktree path, the pinned base SHA, its [work order](../reference/WORK_PACKAGE_BACKLOG.md), allowlist and required checks. Require it to record `git rev-parse HEAD` and `git status --short --branch` before changes. One writer per worktree. The session produces a manifest and evidence. It never admits its own result to integration.

## Run from a trade worktree

Use Node and npm versions reported in the [admission evidence](../manifests/baseline-verification.json) when reproducing WC01. Keep private dependencies per worktree. Run one distinct dev port per trade, for example 5174, 5175 or 5176. Launch Vite from a full path because a Windows short path caused an HTML proxy error in verification.

```powershell
npm.cmd ci --no-audit --no-fund
npm.cmd run dev -- --port 5174 --strictPort
# In a separate terminal for focused checks
node --test scripts/testF1SiltFlow.mjs scripts/testWave1TargetLifecycle.mjs
node --test scripts/testC2CascadeVisuals.mjs scripts/testB5GraveCoreFeedback.mjs
node --test scripts/testT1ReturnReadout.mjs scripts/testC63RouteReadiness.mjs
# Run the matching command above for the released trade. Include its approved new focused test if applicable.
powershell -NoProfile -File docs/construction/WC01/tools/run-wc01-gates.ps1
```

The named WC01 gate runs the admitted combined test set, nine supplemental checks, and the production build. Add trade, current Core Work, Silt, and normal Comb/Aperture or controller evidence required by the work order and inspection plan. The current full normal Comb/Aperture tour remains an open verification item. Historical validators must be recorded separately rather than treated as WC01 passes.

## Inspect changes and pull requests

```powershell
git --no-optional-locks status --short --branch
git diff --stat
git diff --cached --name-status
git diff --name-status $Pinned
git ls-files --others --exclude-standard
```

Compare the committed, staged, unstaged and untracked paths to the order and allowlist. Include before/after hashes and exact base/head SHAs in the PR. Use GitHub **Files changed** and **Checks** from the [pull request list](https://github.com/vrocchino45-eng/BLOB-HOST-CORE/pulls). Review a PR locally only after ref-fetch approval, using a separate coordination or review checkout.

```powershell
$PrNumber = 123 # replace with the approved PR number
git fetch origin 'refs/heads/integration/wc01-candidate-01'
git fetch origin "refs/pull/${PrNumber}/head"
$ReviewBase = '<full PR base SHA advertised by GitHub>'
git log --oneline "$ReviewBase..FETCH_HEAD"
git diff --name-status "$ReviewBase...FETCH_HEAD"
git diff "$ReviewBase...FETCH_HEAD" --
```

## Keep the human build separate

Only after candidate approval, create a separate detached checkout at the reviewed candidate SHA. Never point the human session at a trade dev port. Record flags, candidate SHA, build ID, display size, camera and controller in the playtest log. Serve the production build locally.

```powershell
$CandidateSha = '<approved integration candidate SHA>'
$HumanTree = Join-Path $TradeParent 'HUMAN'
git worktree add --detach $HumanTree $CandidateSha
code --new-window $HumanTree
Set-Location -LiteralPath $HumanTree
git rev-parse HEAD
npm.cmd ci --no-audit --no-fund
npm.cmd run build
npm.cmd run preview -- --port 4173 --strictPort
```

Open `http://127.0.0.1:4173/` for default play. Use `http://127.0.0.1:4173/?flow=1&nearWorld=1` only for the approved experimental comparison. Keep the gameplay canvas active and press **Shift+T** to export session telemetry. Save the JSON, controller notes, timestamps and capture outside the repository. Report expected and actual target, contact and outcome alongside the relevant event. Review and redact public attachments separately before upload.

[Boot flags](../../../../src/main.js) · [Telemetry export](../../../../src/core/SessionTelemetrySystem.js) · [Inspection workflow](INSPECTION_WORKFLOW.md)
