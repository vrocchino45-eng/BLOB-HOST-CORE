param([switch]$PlanOnly)

$ErrorActionPreference = 'Stop'
$RepoRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '../../../..')).Path
$Focused = @(
    'testWave1CoreEngine', 'testWave1VerbInteraction', 'testWave1HostResponse',
    'testWave1FeedbackState', 'testWave1TargetLifecycle', 'testF1SiltFlow',
    'testC2CascadeVisuals', 'testC2ContextualLabels', 'testLocalSiltSeepExchange',
    'testLocalSiltEcologicalResistance', 'testSiltHeldMotionReporting',
    'testB5FlowReserveSettlement', 'testB5GraveCoreFeedback',
    'testC63RouteReadiness', 'testT1ReturnReadout'
) | ForEach-Object { "scripts/$_.mjs" }
$Supplemental = @(
    'verifyWave1CoreProfiles', 'checkC63HubRouteAccess', 'validateRecipeDataLoad',
    'smokeHC031W1StabilizedAimLocalContact', 'smokeHC031U21RelationshipIntentLatch',
    'validateLS1BLivingSiltMaterialCycle', 'validateHC016QTenderCompanion',
    'validateHC031C2FragmentFieldCapture', 'validateHC031DRuptureConsequence'
) | ForEach-Object { "scripts/$_.mjs" }

Push-Location -LiteralPath $RepoRoot
try {
    foreach ($GatePath in ($Focused + $Supplemental)) {
        if (-not (Test-Path -LiteralPath $GatePath -PathType Leaf)) {
            throw "Missing planned gate: $GatePath"
        }
    }

    if ($PlanOnly) {
        Write-Output ('node --test --test-reporter=tap ' + ($Focused -join ' '))
        foreach ($GatePath in $Supplemental) { Write-Output "node $GatePath" }
        Write-Output 'npm.cmd run build'
        return
    }

    & node --test --test-reporter=tap @Focused
    if ($LASTEXITCODE -ne 0) { throw "Focused gates exited $LASTEXITCODE" }

    foreach ($GatePath in $Supplemental) {
        & node $GatePath
        if ($LASTEXITCODE -ne 0) { throw "Gate failed: $GatePath (exit $LASTEXITCODE)" }
    }

    & npm.cmd run build
    if ($LASTEXITCODE -ne 0) { throw "Production build exited $LASTEXITCODE" }
} finally {
    Pop-Location
}
