$ErrorActionPreference='Stop'
$path=Join-Path (Get-Location) 'src/ecology/OrbiterSystem.js'
if (!(Test-Path -LiteralPath $path)) { throw "Missing $path; run from project root" }
$src=[System.IO.File]::ReadAllText($path)
if ($src.Contains('GSL4E2C runtime toggle')) { Write-Host 'GSL4E2C already installed; no changes.'; exit 0 }
$required=@('GSL4E2BReadOnlyAdapter','this.gsl4e2b = new GSL4E2BReadOnlyAdapter();','const gslEnabled = Boolean(frameState.gsl4e2bEnabled);','  update(dt, frameState) {')
foreach ($anchor in $required) { if (!$src.Contains($anchor)) { throw "Missing expected GSL4E2B anchor: $anchor. No changes made." } }
$ctor='    this.gsl4e2b = new GSL4E2BReadOnlyAdapter();'
$ctorAdd=@'
    // GSL4E2C runtime toggle: only affects Guide response; never writes to LS1.
    this.gsl4e2cEnabled = false;
    this.gsl4e2cLastReport = "";
    this.gsl4e2cToggle = (event) => {
      if (event.code !== "F9" || !event.ctrlKey || !event.shiftKey || event.repeat) return;
      this.gsl4e2cEnabled = !this.gsl4e2cEnabled;
      this.gsl4e2b = new GSL4E2BReadOnlyAdapter(); // fresh transition history per comparison
      this.gsl4e2cLastReport = "";
      console.info(`[GSL4E2C] ${this.gsl4e2cEnabled ? "ON" : "OFF"} (Ctrl+Shift+F9)`);
    };
    if (typeof window !== "undefined") window.addEventListener("keydown", this.gsl4e2cToggle);
'@
$src=$src.Replace($ctor,$ctor+"`n"+$ctorAdd)
$update='  update(dt, frameState) {'
$updateAdd=@'
    // GSL4E2C runtime toggle: disabled at startup; no mutation of attachment state.
    frameState.gsl4e2bEnabled = this.gsl4e2cEnabled;
'@
$src=$src.Replace($update,$update+"`n"+$updateAdd)
$needle='      frameState.gsl4e2bDebug = { enabled: true, mode: gsl.mode, event: gsl.event, authoredOverride: authored };'
if (!$src.Contains($needle)) {throw 'Expected GSL debug anchor missing. No changes made.'}
$diagnostics=@'
      const report = `${gsl.mode}|${gsl.event}|${gsl.active}|${gsl.reason}|${authored}`;
      if (report !== this.gsl4e2cLastReport) {
        this.gsl4e2cLastReport = report;
        console.info("[GSL4E2C]", { mode: gsl.mode, event: gsl.event, attached: gsl.active, detachReason: gsl.reason, authoredOverride: authored });
      }
'@
$src=$src.Replace($needle,$needle+"`n"+$diagnostics)
$backup="$path.GSL4E2C.bak"
if (Test-Path -LiteralPath $backup) {throw "Backup already exists: $backup. No changes made."}
Copy-Item -LiteralPath $path -Destination $backup
try {[System.IO.File]::WriteAllText($path,$src,(New-Object System.Text.UTF8Encoding($false)))} catch {Copy-Item -LiteralPath $backup -Destination $path -Force;throw}
Write-Host 'GSL4E2C installed. Default OFF. Ctrl+Shift+F9 toggles during gameplay; diagnostics in browser console.'
Write-Host "Backup: $backup"
