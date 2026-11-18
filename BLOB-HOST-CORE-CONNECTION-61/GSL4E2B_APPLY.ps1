param([switch]$EnableGSL)
$ErrorActionPreference='Stop'
$path=Join-Path (Get-Location) 'src/ecology/OrbiterSystem.js'
if (!(Test-Path $path)) { throw "Run from BLOB-HOST-CORE root; missing $path" }
$expected='4c107f4d6fc29389bcb0474680b23ee7e6ab0571b980e5f3cddf4ca85e84332d'
$actual=(Get-FileHash -Algorithm SHA256 -LiteralPath $path).Hash.ToLowerInvariant()
if ($actual -ne $expected) { throw "OrbiterSystem source differs from verified handoff. No files changed. Expected $expected got $actual" }
$src=Get-Content -LiteralPath $path -Raw
$needle='import * as THREE from "three";'
if (!$src.Contains($needle)) {throw 'Unexpected source header; no files changed.'}
$src=$src.Replace($needle,$needle+"`n"+'import { GSL4E2BReadOnlyAdapter } from "../../GSL4E2B_ReadOnlyAdapter.mjs";')
$needle='    this.orbiters = [];'
if (!$src.Contains($needle)) {throw 'Constructor anchor missing; no files changed.'}
$src=$src.Replace($needle,'    this.gsl4e2b = new GSL4E2BReadOnlyAdapter();'+"`n"+$needle)
$needle='    if (!coreWorkActive && pulseT > 0.05) {'
if (!$src.Contains($needle)) {throw 'Guide override anchor missing; no files changed.'}
$insert=@'
    // GSL-4E2B: opt-in only. Authored Guide decisions always win.
    const gslEnabled = Boolean(frameState.gsl4e2bEnabled);
    if (gslEnabled) {
      const gsl = this.gsl4e2b.sample(frameState, Number.isFinite(t) ? t : 0);
      const authored = coreWorkActive || shimmerActive || guideTarget !== "player" || pulseT > 0.05;
      if (!authored && gsl.mode === "concern") {
        targetPosition = this.temp.copy(this.playerRoot.position).add(this.guideOffset).multiplyScalar(1);
        targetPosition.y += 0.12;
        state = "gsl_concern";
      } else if (!authored && gsl.mode === "support") {
        targetPosition = this.temp.copy(this.playerRoot.position).add(this.guideOffset);
        targetPosition.x *= 1;
        state = "gsl_support";
      }
      frameState.gsl4e2bDebug = { enabled: true, mode: gsl.mode, event: gsl.event, authoredOverride: authored };
    }

'@
$src=$src.Replace($needle,$insert+$needle)
$backup="$path.GSL4E2B.bak"
Copy-Item -LiteralPath $path -Destination $backup -ErrorAction Stop
try { Set-Content -LiteralPath $path -Value $src -Encoding UTF8 -NoNewline } catch { Copy-Item $backup $path -Force; throw }
Write-Host "Patched OrbiterSystem. Original backed up at $backup. GSL is OFF by default."
Write-Host 'To opt in for testing, set frameState.gsl4e2bEnabled = true at a controlled debug initialization point.'
