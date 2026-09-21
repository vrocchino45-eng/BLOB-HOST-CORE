# HC025B Build Report — Chemistry-Driven Attachment Proof

## Scope

HC025B implements the first mechanical consequence of spatial Core chemistry: Silt Pressure positioned at the Membrane can attach the Core to the existing trusted Host movement boundary when the Silt-bearing side is sufficiently aligned with that surface.

## Ownership

- **CoreEmbodimentSystem**: retained anatomy placement, three-zone chemistry, exact Silt telemetry, visual contact language.
- **PlayerMovementController**: translation, boundary sampling, attachment state, tangent velocity, release movement.
- **PlaytestHudSystem**: debug-only attachment telemetry readout.
- **RecipeDataSystem**: successor contract validation.

No new runtime source module was created.

## Mechanical rule

Attachment strength is derived from:

- Silt being in the Membrane zone,
- exact Silt-to-surface directional alignment,
- current membrane/topology expression,
- current chemistry cloud pattern strength.

The Core must approach the existing boundary before attachment can acquire. While attached, radial velocity is removed and the Core is projected smoothly to an interior membrane shell. Pulling away from the contacted membrane releases the Core.

## HC024E inherited fix

The HC024E output bridge previously compared retained family IDs directly against shortened output-family keys. HC025B now maps:

- `grave_memory_retention -> grave_memory`
- `vascular_rhythm_retention -> vascular_rhythm`
- `silt_pressure_retention -> silt_pressure`

This restores intended Memory/Rhythm/Pressure output intensity for existing Host-response behavior.

## Validation

Passed:

- HC025B attachment validator
- HC025A contact-language predecessor
- HC024E Host-response predecessor
- HC024D3 / D2 / D1 chemistry regressions
- HC024D0C / D0B / D0A / D0 Core Work regressions
- HC024C2 / C1 / C / B / A regressions
- HC023D Hotfix1 / HC023D / HC023C / HC023B / HC023A regressions
- RecipeDataSystem load validation
- undefined `this.method()` audit
- syntax check across all 88 active JS source modules
- local static and literal dynamic import resolution audit

## Production bundle

Not verified in-container because `node_modules` is not included in the source checkpoint. No dependency directory is packaged.
