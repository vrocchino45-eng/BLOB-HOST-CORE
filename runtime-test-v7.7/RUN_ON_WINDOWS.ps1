param([string]$GameRoot = (Get-Location).Path, [switch]$Install)
$ErrorActionPreference = 'Stop'
$GameRoot = (Resolve-Path $GameRoot).Path
$Out = Join-Path $PSScriptRoot 'runtime-results'
New-Item -ItemType Directory -Force -Path $Out | Out-Null
Push-Location $GameRoot
try {
  node --version *> (Join-Path $Out 'node-version.txt')
  npm --version *> (Join-Path $Out 'npm-version.txt')
  if ($Install) {
    npm ci --no-audit --no-fund *> (Join-Path $Out 'npm-ci.log')
    "npm ci exit: $LASTEXITCODE" | Out-File (Join-Path $Out 'install-status.txt')
    if ($LASTEXITCODE -ne 0) { throw 'npm ci failed. See npm-ci.log' }
  }
  python (Join-Path $PSScriptRoot 'run_runtime_gate.py') $GameRoot *> (Join-Path $Out 'gate-result.json')
  "gate exit: $LASTEXITCODE" | Out-File (Join-Path $Out 'gate-status.txt')
} finally { Pop-Location }
Write-Host "Results: $Out"
