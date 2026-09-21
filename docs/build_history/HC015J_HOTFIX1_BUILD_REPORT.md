# BLOB: HOST CORE — HC015J HOTFIX1

## Failure reproduced
Boot stopped in `RecipeDataSystem.validateFirstSliceRuntimeData()` with:
`Missing HC-014A Act 1/Aperture arrival runtime profile.`

## Root cause
HC015J correctly loaded `/data/runtime/act1RuntimeProfile_HC015J.json`, whose inherited profile id is
`ACT1_RUNTIME_PROFILE_HC014G` and whose successor pass is `HC-015J`.

The validator's allowed successor-pass list ended at `HC-015G`, so HC015J was rejected before runtime startup.
The error text was historical and therefore misleading.

## Fix
- Added HC-015H, HC-015I, and HC-015J to the allowed successor-pass lineage.
- Kept the inherited runtime profile id and all gameplay/system declarations unchanged.
- Replaced the misleading HC-014A-specific error text with a generic current-profile error.
- No Signal Plain gameplay, response visuals, camera, movement, gates, or progression logic changed.

## Acceptance
HC015J profile must load and pass the first runtime-profile lineage gate before gameplay startup.
