# HC025C Build Report — Contact Surface Coverage Lock

## Scope

HC025C audits and locks the physical surface authority inherited by HC025B before any new Host geometry becomes contactable.

## Ownership

- **PlayerMovementController** — sole movement boundary, attachment physics, and contact-surface coverage classifier.
- **CoreEmbodimentSystem** — unchanged retained anatomy / chemistry / contact body language owner.
- **PlaytestHudSystem** — debug-only coverage label.
- **RecipeDataSystem** — HC025C contract validation.

No new runtime source module was created.

## Coverage map

The current runtime can now distinguish:

1. **Shared first-slice envelope** — fallback world-origin ellipsoid used when no region-local bounds are active.
2. **Region-local envelope** — entry-anchored ellipsoid supplied by route/threshold runtime owners.
3. **Field-volume envelope** — larger authored field-space movement envelope.
4. **Other authored movement envelope** — explicit movement-boundary modes outside those categories.

The classifier publishes the active region ID, boundary mode, owner, and tuning owner. It explicitly reports that interior decorative geometry is not contact authority.

## Existing authored publishers confirmed in source audit

Current movement-boundary authorship already exists in systems including:

- `Act1RouteContractSystem`
- `GraveMemoryRouteSystem`
- `VascularRhythmRouteSystem`
- `CombThresholdFoundationSystem`
- `ApertureFieldsArrivalSystem`

When none of those region-local/field bounds is active, `PlayerMovementController` falls back to the shared first-slice envelope.

## Gameplay effect

None beyond HC025B. HC025C does not change attachment acquisition, tangent traversal, release thresholds, speed, collision, or chemistry.

## Validation

Passed:

- HC025C coverage-lock validator
- HC025B chemistry-driven attachment regression
- HC025A contact-language regression
- HC024E / HC024D / HC024C / HC024B / HC024A regressions
- HC023D Hotfix1 / HC023D / HC023C / HC023B / HC023A regressions
- RecipeDataSystem load validation
- undefined `this.method()` audit
- syntax check across all 88 active JS source modules
- local static import resolution audit
- JSON parse validation

## Production bundle

Not verified in-container because `node_modules` is not included in the source checkpoint. No dependency directory is packaged.
