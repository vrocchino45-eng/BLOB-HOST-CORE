$ErrorActionPreference='Stop'
$path='src/ecology/OrbiterSystem.js'
if (!(Test-Path $path)) {throw 'Missing OrbiterSystem.js'}
$s=Get-Content $path -Raw
foreach($a in @('GSL4E2C runtime toggle','this.gsl4e2cEnabled = false','event.code !== "F9"','frameState.gsl4e2bEnabled = this.gsl4e2cEnabled','GSL4E2BReadOnlyAdapter')) {if (!$s.Contains($a)) {throw "Missing $a"}}
Write-Host 'PASS: runtime toggle, default OFF, event diagnostics, GSL4E2B adapter preserved.'
