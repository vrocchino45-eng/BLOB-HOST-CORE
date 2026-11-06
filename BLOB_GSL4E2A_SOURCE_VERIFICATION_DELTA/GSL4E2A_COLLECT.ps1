$ErrorActionPreference = 'Stop'
$root = (Get-Location).Path
$files = @('src/ecology/OrbiterSystem.js','src/visual/composers/OrbiterVisualComposer.js','src/player/PlayerMovementController.js','src/telemetry/SessionTelemetrySystem.js')
$out = Join-Path $root 'GSL4E2A_SOURCE_HANDOFF'
New-Item -ItemType Directory -Path $out -Force | Out-Null
$manifest = @()
foreach ($relative in $files) {
  $source = Join-Path $root ($relative -replace '/', [IO.Path]::DirectorySeparatorChar)
  if (Test-Path -LiteralPath $source -PathType Leaf) {
    $target = Join-Path $out ($relative -replace '/', [IO.Path]::DirectorySeparatorChar)
    New-Item -ItemType Directory -Path (Split-Path $target -Parent) -Force | Out-Null
    Copy-Item -LiteralPath $source -Destination $target -Force
    $manifest += [pscustomobject]@{ path=$relative; present=$true; sha256=(Get-FileHash -LiteralPath $source -Algorithm SHA256).Hash }
  } else {
    $manifest += [pscustomobject]@{ path=$relative; present=$false; sha256=$null }
  }
}
$gitHead = $null
if (Get-Command git -ErrorAction SilentlyContinue) { $gitHead = (git rev-parse HEAD 2>$null) }
[pscustomobject]@{schema='BLOB-GSL4E2A-SOURCE-HANDOFF-v1'; gitHead=$gitHead; files=$manifest} | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath (Join-Path $out 'manifest.json') -Encoding UTF8
$zip = Join-Path $root 'BLOB_GSL4E2A_SOURCE_HANDOFF.zip'
if (Test-Path -LiteralPath $zip) { Remove-Item -LiteralPath $zip -Force }
Compress-Archive -Path $out -DestinationPath $zip -CompressionLevel Optimal
Write-Host "Created: $zip"
