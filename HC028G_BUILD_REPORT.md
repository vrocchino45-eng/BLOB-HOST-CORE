# HC-028G — Verb Visual + Lift Field Readability

**Parent:** HC-028F1 — Hub Deliberate Route Commit  
**Build:** HC-028G  
**Package version:** 0.28.12  
**Mode:** convergence / presentation / feedback integration

## Purpose
HC028G upgrades how the already-working Core verbs and vertical environmental force explain themselves in the world. It does not rebalance the verbs or movement system.

The playtest problem was presentation, not authority:

- Pulse still read too much like a generic expanding blast.
- Absorb worked but its transfer path did not strongly communicate controlled inward incorporation.
- Stabilize still leaned on generic target rings instead of the Core's newer gyroscopic language.
- Vertical resistance/support was physically present through authored route flow/pressure, but the player often discovered it only by attempting to rise and feeling the result.

## Source audit finding — “thermal spots”
There is **no dedicated fixed thermal/updraft spot map** in HC028F1. Vertical difficulty comes from the actual authored regional state consumed by `PlayerMovementController`: route tangent/current, pressure, compression, and environmental flow. Some of those values vary with position (Guide eddies, route tangent/progress, Silt pressure pocket, Grave depth, etc.), but there is not a separate hidden array of thermal columns.

HC028G therefore does **not** invent fake visible columns. It visualizes the resolved `playerKinematics.environmentalForceVector` that movement already applied. When authored flow changes with position, the visual field changes with it.

## Runtime changes

### 1. Pulse — contour propagation
Owner: `src/player/CoreVerbPhysicalizationSystem.js`

- Keeps the existing sonar/outgoing propagation front.
- Reduces the outgoing sphere's visual dominance.
- When actual chemistry geometry answers the Pulse, HC028G snapshots up to seven visible child meshes from that answering object's real geometry using `THREE.WireframeGeometry`.
- The temporary contour grows subtly away from the source and fades.
- Deep structural reads can persist slightly longer / resolve a slightly broader contour.
- Host-boundary answers still use the existing boundary response because there is no concrete chemistry mesh to contour.

No Pulse gameplay range, wave timing, chemistry authority, target count, damage/force, or route truth changed.

### 2. Absorb — helical transfer / incorporation
Owner: `src/player/CoreVerbPhysicalizationSystem.js`

- Keeps the existing target-to-Core stream axis and three funnel rings.
- Adds three animated helical transfer filaments between target and Core.
- Absorbed material fragments now corkscrew inward rather than linearly lerping straight into the Core.
- Funnel rings tighten/rotate along the transfer path so the whole action reads as contact → tether → draw → incorporation.

No `BondSystem` absorb progress/power, chemistry, range, targeting, movement cost, or completion behavior changed.

### 3. Stabilize — gyroscopic capture / alignment
Owner: `src/player/CoreVerbPhysicalizationSystem.js`

- Replaces the three identical static target rings with three differently sized gyroscopic bands.
- Low coherence = larger wobble/precession.
- As existing Stabilize progress rises, wobble collapses and the counter-oriented bands settle toward a coherent lock.
- Contact-flash spam is reduced because the moving gimbal itself now carries more of the read.

No Stabilize coherence multiplier, route stabilization requirement, movement effect, range, or gameplay outcome changed.

### 4. Lift-field readability
New read-only owner: `src/world/LiftFieldReadabilitySystem.js`

- Runs after `PlayerMovementController` so it reads the force actually resolved by movement.
- Source truth: `frameState.playerKinematics.environmentalForceVector` plus current pressure context.
- Renders seven low-opacity local streamlines and moving direction beads around the Core.
- Rising support straightens/extends the field upward.
- Downwash/high-pressure resistance compresses and curls the field.
- Mixed flow stays less directional.
- The cue fades when vertical/environmental force is weak.
- Disabled during HC028F1 guided Hub commit and Core Work so it does not fight those presentations.

The system explicitly publishes:

- `movementAuthority: false`
- `collisionAuthority: false`
- `routeAuthority: false`
- `verbAuthority: false`
- `fixedThermalSpotMap: false`

It contains no write path to player position or movement velocity.

## Runtime diff from HC028F1
Only these runtime changes exist:

- `src/main.js` — build identity
- `src/core/GameRuntime.js` — instantiate/register LiftFieldReadabilitySystem
- `src/player/CoreVerbPhysicalizationSystem.js` — verb VFX upgrade
- `src/world/LiftFieldReadabilitySystem.js` — new presentation-only field reader

All 27 locked gameplay/system owners match HC028F1 byte-for-byte, including PlayerMovementController, Core engine/coupling/sensory systems, Bond/ChemObject, Host rhythm/composition, regional physical embodiment, ambient Host material, audio, Hub commit owners, and all eight region gameplay owners.

## Validation
Passed:

- `validate:hc028g`
- recipe-data load
- undefined `this.method()` audit
- all **99** runtime JS files `node --check`
- all **377** public JSON files parse
- 27 locked owner hashes

The package contains no local `node_modules`, so a production Vite render was not executed in this environment.

## Acceptance target
HC028G succeeds if the player can distinguish all three verbs by world motion alone and can tell the difference between **vertical support**, **mixed flow**, and **pressure/downwash resistance** before interpreting the result as broken vertical controls.
