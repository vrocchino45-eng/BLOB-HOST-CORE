# Baseline publication plan

Approval required before executing anything that writes a Git ref, creates a Git worktree, stages or commits the source, or publishes to GitHub. Use a separate publication clone and a new one-purpose ref `baseline/wc01-admitted-v1` with parent `d7517ee78361bed2c50dc726472b9a2aa099331a`. The approved gameplay checkpoint is the exact 33 overlay paths in [the manifest](../manifests/working-tree-changes.json). Review the documentation as a distinct second commit. Pin the final published SHA for all trades. `main`, `CONNECTION-61`, `integration/wave-1`, the dirty feature checkout and historical refs stay untouched.

## Review before staging

The approval record must name the parent, the overlay manifest hash, each proposed commit's scope, the destination branch, the proposed documentation manifest, and public disclosure approval. GitHub is public. Review staged content for credentials, personal paths or raw player evidence. The snapshot summary, rather than unrelated ignored files or installed dependencies, accompanies the overlay.

The following PowerShell is planned only. Run from the original project root and stop immediately after any unexpected exit or comparison. Do not run a Git-wide add. The executable overlay checker reads exact file bytes.

```powershell
$SourceRoot = (Get-Location).Path
$Parent = 'd7517ee78361bed2c50dc726472b9a2aa099331a'
$PublicationRef = 'baseline/wc01-admitted-v1'
$RepositoryUrl = 'https://github.com/vrocchino45-eng/BLOB-HOST-CORE.git'
$PublishTree = Join-Path (Split-Path $SourceRoot -Parent) 'BLOB-WC01-publish'
$VerifyTree = Join-Path (Split-Path $SourceRoot -Parent) 'BLOB-WC01-verify'
$Coord = Join-Path $SourceRoot 'docs/construction/WC01'
$Overlay = Get-Content -LiteralPath (Join-Path $Coord 'manifests/working-tree-changes.json') -Raw | ConvertFrom-Json
$OverlayPaths = @($Overlay | ForEach-Object { $_.path })
$OverlayCheck = Join-Path $Coord 'tools/verify-overlay.mjs'

git --no-optional-locks status --short --branch
git --no-optional-locks rev-parse HEAD refs/heads/CONNECTION-61
node $OverlayCheck $SourceRoot
git ls-remote --heads origin "refs/heads/$PublicationRef"
git show-ref --verify "refs/heads/$PublicationRef"
```

The last checks must show the proposed branch absent locally and remotely. `git show-ref --verify` returns nonzero when the local branch is absent. Choose a new name with approval if it exists. Confirm the two destination directories are unused.

## Construct the exact commits after approval

```powershell
git clone --no-checkout --no-local --single-branch --branch feature/f1-flow-silt-circuit $SourceRoot $PublishTree
git -C $PublishTree config core.autocrlf false
git -C $PublishTree remote set-url origin $RepositoryUrl
git -C $PublishTree switch -c $PublicationRef $Parent
foreach ($entry in $Overlay) {
  $target = Join-Path $PublishTree $entry.path
  New-Item -ItemType Directory -Force -Path (Split-Path $target -Parent) | Out-Null
  Copy-Item -LiteralPath (Join-Path $SourceRoot $entry.path) -Destination $target
}
node $OverlayCheck $PublishTree
git -C $PublishTree add -- @OverlayPaths
$Staged = @(git -C $PublishTree diff --cached --name-only)
if (Compare-Object ($OverlayPaths | Sort-Object) ($Staged | Sort-Object)) { throw 'Overlay staging differs from approved paths' }
node $OverlayCheck $PublishTree --index
git -C $PublishTree diff --cached --check
git -C $PublishTree diff --cached --stat
git -C $PublishTree commit -m 'chore(wc01): capture admitted source baseline'
```

Copy and stage the reviewed durable documentation explicitly in the publication worktree. Keep that commit limited to `docs/construction/WC01/`.

```powershell
$DocInventory = Get-Content -LiteralPath (Join-Path $Coord 'manifests/durable-files.json') -Raw | ConvertFrom-Json
$DocPaths = @($DocInventory.files | ForEach-Object { "docs/construction/WC01/$($_.path)" })
$DocPaths += 'docs/construction/WC01/manifests/durable-files.json'
foreach ($doc in $DocPaths) {
  $target = Join-Path $PublishTree $doc
  New-Item -ItemType Directory -Force -Path (Split-Path $target -Parent) | Out-Null
  Copy-Item -LiteralPath (Join-Path $SourceRoot $doc) -Destination $target
}
git -C $PublishTree add -- @DocPaths
$Staged = @(git -C $PublishTree diff --cached --name-only)
if (Compare-Object ($DocPaths | Sort-Object) ($Staged | Sort-Object)) { throw 'Documentation staging differs from approved paths' }
git -C $PublishTree diff --cached --check
git -C $PublishTree commit -m 'docs(wc01): record construction coordination and gates'
$Pinned = (git -C $PublishTree rev-parse HEAD).Trim()
git -C $PublishTree worktree add --detach $VerifyTree $Pinned
node $OverlayCheck $VerifyTree
git -C $PublishTree diff --name-status "$Parent..$Pinned"
```

The fresh checkout must match admitted raw hashes for all 33 files. The admitted files include 26 LF and seven CRLF files, with no effective path attributes on those files. Set `core.autocrlf=false` only in the separate publication clone, then compare both staged blobs and the detached checkout. If filters or checkout conversion change any byte, stop and obtain a reviewed resolution or amended admission. Do not silently reinterpret an exact hash as a normalized match. Install from `package-lock.json` and run the full named WC01 gate from the verification tree. Record Node/npm versions, fresh tree cleanliness, build, and previous historical exceptions. See [environment commands](ENVIRONMENTS.md).

## Publish only the reviewed SHA

Show the owner the final SHA, 33-file verification, reviewed document inventory, full gate result, and public destination. Obtain explicit approval to push that SHA. Check the destination again before copying it to GitHub.

```powershell
git ls-remote --heads origin "refs/heads/$PublicationRef"
git -C $PublishTree push origin "${Pinned}:refs/heads/$PublicationRef"
git ls-remote --heads origin "refs/heads/$PublicationRef"
```

The precheck must be empty. The postcheck must equal `$Pinned`. A rejection or unexpected ref requires a new review. No force, tag, merge, or other destination is in this plan. Publish labels, issues, PRs, branch rules and release artifacts only under separate authorization.
