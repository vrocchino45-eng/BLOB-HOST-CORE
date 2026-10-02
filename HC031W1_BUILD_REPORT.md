# HC031W1 — Stabilized Aim + Local Contact Proof

Parent: HC031W Controller / Targeting / Surface Interaction Audit  
Build: HC-031W1  
Package: 0.31.54  
Telemetry: blob.session.telemetry.v1.52

## Why this pass exists

HC031W human telemetry proved that Stabilize could form and hold a relationship to the macro `gathering_ground_cluster` well outside the local assist range while the Watcher/Relay ecology was being interpreted by a separate proximity grammar. It also proved that `CELL_APERTURE_FIELDS_ARRIVAL_001` had zero authored crawlable surfaces.

W1 converges those two gaps without reopening the accepted U2.1 ecology mechanics.

## Behavior changes

### Local relationship nouns
After physical Gathering Ground entry, `EntitySystem` publishes the visible Gathering Ground Watcher and two Relay instances as `local_entity` attention candidates. They enter the same camera-aim vocabulary as other targetable nouns.

Before entry, this provider is inactive. The accepted T4/T6 remote Gathering Ground observation and Stabilize relationship remain available.

### Stabilize + Right Stick steering
Normal right-stick camera input still chooses candidate aim. While Stabilize is held, deliberate right-stick motion can redirect the held attention/relationship to a different centered local noun when:

- RS magnitude >= 0.18
- candidate aim dot >= 0.70
- candidate is relationship-eligible at local working range
- candidate remains the intended redirect for 0.09 seconds

The short dwell filters camera jitter. Once physically local, LT+RS will not redirect a local organism relationship back onto the whole macro Gathering Ground territory.

### Macro relationship suppression
Once Gathering Ground is physically local, a macro-world target must be within its working range to become/continue an ordinary Stabilize relationship. A far macro relationship is released with reason `stabilize_macro_relationship_suppressed_local_context`.

This rule is deliberately local-context only; pre-entry remote relationship behavior remains unchanged.

### Three contact-capable surfaces
W1 authors exactly three surfaces through the existing `CrawlableSurfaceRegistry` metadata path:

- `GATHERING_GROUND_WATCHER_MEMBRANE` — `membrane_stable`
- `GATHERING_GROUND_RELAY_SCAR_BRACE` — `scar_brace`
- `GATHERING_GROUND_RIDGE_RETURN_RESIDUE` — `residue_weak`

All three are targeting-suppressed. `CoreSurfaceTruthSystem` and `PlayerMovementController` remain the contact/movement authorities.

The three contact meshes are anchored to the canonical Aperture/Gathering Ground world frame rather than animated entity transforms, so a suction/support point cannot drift underneath the Core when a Watcher or Relay performs idle motion.

## Locked systems

No changes to:

- `InputSystem`
- `PlayerMovementController`
- `EntityRelationshipGrammarSystem`
- `CrawlableSurfaceRegistry` profile values
- `CoreSurfaceTruthSystem`
- Membrane Ridge traversal
- Aperture adjacent-territory opening/entry law
- U2.1 Gathering Ground reactive timing, intent latch, interruption, rearm, or recurrence methods
- canonical target scoring formula
- verb-intent grammar

## Validation

`npm run validate:current` PASS.

The chain includes:

- HC031W1 structural validator
- HC031W1 deterministic Stabilized Aim + Local Contact smoke
- HC031V telemetry/readability checks
- HC031U2.1 latch smoke and six-profile bot convergence
- HC031U/U1/U2 structural checks
- HC031T5 Ridge frame-rate smoke at 30/60/120/144 FPS
- undefined `this.method()` audit
- RecipeData load validation
- syntax checks for changed runtime files

The W1 smoke proves:

1. pre-entry macro Gathering Ground Stabilize relationship remains valid;
2. after entry, a centered Watcher becomes the canonical attention/relationship noun;
3. LT+RS redirects Watcher → Relay after the short dwell;
4. steering back toward the macro body does not steal the local relationship;
5. a pre-existing far macro relationship is dropped once the territory becomes local;
6. exactly three authored Gathering Ground surfaces are visible to `CoreSurfaceTruthSystem`.

## Production build note

`npm run build` in the Linux packaging environment is blocked by the inherited Windows-origin `node_modules` tree missing optional Rollup binary `@rollup/rollup-linux-x64-gnu`. No dependency install or lockfile rewrite was performed to work around that environment mismatch. Runtime/structural validation is green.
