# HC026A1 Build Report — Hub Macro Spatial Exaggeration

## Build identity

- Build: HC-026A1
- Version: 0.26.1
- Parent: HC-026A
- Active source modules: 88

## Change summary

HC026A proved the Hub/Core data mirror but live screenshots showed the retained Hub echoes still reading too close to the player Core. HC026A1 keeps the same ownership and stable route topology while increasing environmental-scale radial separation and reducing exact-direction influence.

## Implementation

- Zone radii changed from 1.28 / 2.62 / 4.18 to 1.55 / 3.75 / 6.25.
- Exact telemetry blend changed from 0.34 to 0.22.
- Zone silhouette scaling added: 0.78 / 1.08 / 1.38.
- Central topology spread contrast strengthened.
- Existing biological echo animations remain active underneath placement/scale.
- Debug Hub preview remains progression-neutral.

## Validation

- `npm run validate:current` PASS.
- HC026A1 validator PASS.
- HC026A predecessor spatial-mirror contract PASS.
- HC025C / HC025B / HC025A contact lineage PASS.
- HC024 chemistry/manipulation/camera lineage PASS.
- RecipeDataSystem load validation PASS.
- Undefined `this.method()` audit PASS.
- All 88 source JS modules pass `node --check`.
- 292 public-data JSON files parse successfully.

## Production bundle

Not run because this checkpoint does not contain `node_modules`.

## Live test target

Use Ctrl+3 + P and compare Deep / Inner / Membrane from a wide Hub composition. The Hub should now read as macro anatomy mirroring the Core rather than three structures clustering around the Core.
