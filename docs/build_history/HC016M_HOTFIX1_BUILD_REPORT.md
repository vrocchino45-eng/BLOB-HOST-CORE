# HC016M HOTFIX 1

## Symptom
Boot stopped on the red fatal-error screen:
`[RecipeDataSystem] Missing or unsupported Act 1/Aperture runtime profile for the current successor build.`

## Root cause
HC016M changed the runtime profile's compatibility identity (`id`, `pass`, and
`sourceAuthority`) while `RecipeDataSystem.validateFirstSliceRuntimeData()` still
enforces the existing successor-profile schema. That was an HC016M packaging/schema
mistake, not a gameplay failure.

## Fix
- Restored the profile identity expected by the existing successor validation.
- Restored authoritative source metadata expected by validation.
- Preserved existing compatibility-only GateSystem metadata declarations without
  re-registering GateSystem in the live runtime.
- Preserved the actual HC016M functional correction:
  `membraneRidgeGameplaySystem` is mounted in `aperture_fields`.
- Preserved sampled SystemRegistry timing telemetry.
- Verified that `GameRuntime` still does not register `gateSystem`.

## Test
Boot must pass RecipeDataSystem validation and reach the normal playable runtime.
Then test Aperture -> Signal Plain -> Membrane Ridge and capture any hitch with
the sampled updater telemetry active.
