$ErrorActionPreference = 'Stop'
$root = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$out = Join-Path $root 'C62_RESULTS'
New-Item -ItemType Directory -Force -Path $out | Out-Null
Push-Location $root
try {
  if (!(Test-Path 'package.json')) { throw 'Place these files in the BLOB game root, next to package.json.' }
  if (!(Get-Command python -ErrorAction SilentlyContinue)) { throw 'Python is required. Install Python 3 and try again.' }
  if (!(Get-Command node -ErrorAction SilentlyContinue)) { throw 'Node.js is required. Install Node.js and try again.' }
  if (!(Test-Path 'node_modules/vite')) {
    Write-Host 'Dependencies missing; running npm ci...'
    & npm.cmd ci --no-audit --no-fund *> (Join-Path $out 'npm-ci.log')
    if ($LASTEXITCODE -ne 0) { throw 'npm ci failed; see C62_RESULTS/npm-ci.log' }
  }
  Write-Host 'Running C62 gate (C61 tests + line-ending-tolerant provenance)...'
  & python 'tools/connection62/run_gate.py' $root > (Join-Path $out 'gate-result.json')
  $code = $LASTEXITCODE
  "exit_code=$code" | Set-Content (Join-Path $out 'status.txt')
  Write-Host "Gate exit code: $code"
  Write-Host "Results: $out"
  if ($code -ne 0) { Write-Warning 'Validation did not pass; upload C62_RESULTS for review.' }
} catch {
  "ERROR: $($_.Exception.Message)" | Set-Content (Join-Path $out 'status.txt')
  Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
} finally { Pop-Location }
