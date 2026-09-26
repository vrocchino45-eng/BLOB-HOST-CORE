# HC-031M — Targeting / Attention Ownership

## Mode
Convergence — targeting / attention ownership.

## Parent
HC-031L — Movement + Verb Physical Grammar.

## Why this pass exists
The HC031L playtest showed that the physical verb grammar was active and varied, while targeting candidate changes were comparatively rare. The remaining churn was largely repeated verb engagement/release on the same noun. HC031M therefore does not add a lock button or new targeting mode. It separates **attention ownership** from **verb relationship ownership** so the player chooses a noun with aim and the verbs only modify that noun.

## Canonical law
**Aim chooses and holds the noun. Verbs modify the held relationship.**

Attention state grammar:

`AVAILABLE -> CANDIDATE -> ENGAGED -> HELD -> RELEASED`

- AVAILABLE: targetable matter exists, but nothing is sufficiently aimed.
- CANDIDATE: an available noun is inside the aim candidate cone.
- ENGAGED: centered aim has intentionally acquired the noun; a brief low-opacity confirmation is allowed.
- HELD: aim owns the noun. No persistent generic lock ring is shown.
- RELEASED: deliberate redirect / leaving the hold cone / invalid target releases ownership before another noun can be acquired.

## Implementation
### Aim-dominant candidate ownership
- Candidate cone minimum aim dot: `0.42`.
- Attention acquire aim dot: `0.68`.
- Hold aim dot: `0.24`.
- Acquire dwell: `0.10 s`.
- ENGAGED -> HELD: `0.12 s`.
- Empty-look release grace: `0.30 s`.
- RELEASED settling phase: `0.12 s`.
- Deliberate redirect requires a new candidate to lead current aim by at least `0.22`.
- Candidate hysteresis remains bounded (`0.62` ownership-score margin).

The prior context score remains available for authored/tutorial suggestion, but the new ownership score makes camera alignment dominant:
- aim dot x `12`
- bounded authored/context priority x `0.35`
- bounded distance contribution x `0.18`

The prior Absorb-held candidate boost is removed. A verb can no longer make a noun become the aimed target.

### Verb relationship ownership
- A relationship can be created only from the current aim-owned `attentionTarget`.
- Active verbs protect the already-owned noun from brief camera motion.
- Active verbs cannot retarget to a different candidate.
- On deliberate aim redirect, the old attention owner releases first; the new noun must reacquire through aim.
- The existing `0.28 s` verb relationship release grace remains for closely spaced verb combinations.

### Visual policy
- Persistent generic target lock ring remains retired.
- ENGAGED gets a brief, low-opacity confirmation using the existing halo geometry (max opacity `0.14`).
- HELD returns to body-only readability.
- Pulse / Absorb / Stabilize relationship glyphs still appear only when a verb relationship is active.

## Allowed scope
- TargetingSystem attention/candidate/relationship ownership.
- Read-only targeting telemetry.
- Build identity, contract, validation and focused playtest documentation.

## Forbidden scope / locked systems
No changes to:
- K/K1 movement, attachment, peel or momentum law.
- L physical verb meaning.
- controller mappings or InputSystem.
- Pulse / Absorb / Stabilize primitive effect strength.
- BondSystem / ChemObjectSystem effect authority.
- TargetFocusRegistry authored context rules.
- camera controls.
- ecology behavior.
- route or progression state.
- runtime system order.

14 neighboring owners are SHA-256 locked by `hc031mLockedHashes.json`.

## Retired / disabled legacy behavior
- Removed verb-specific Absorb candidate bias from TargetingSystem.
- Removed mid-relationship `intentional_camera_handoff` behavior.
- Removed verb-driven `setRelationshipTarget(candidate, "verb_engaged")` acquisition.
- No files deleted.

## Telemetry
Schema: `blob.session.telemetry.v1.33`.

New distinction:
- `attention.candidate.changed` — soft aim candidate.
- `attention.owner.changed` — aim-owned noun changes.
- `attention.phase.changed` — AVAILABLE/CANDIDATE/ENGAGED/HELD/RELEASED progression.
- `attention.target.changed` — compatibility event for the verb-scoped relationship target.

Movement samples now include attention owner, phase, aim dot, release grace, and verb relationship target.

## Acceptance tests
1. Centering an ordinary noun beats an off-axis absorbable/high-priority noun.
2. Aim acquires the noun without any verb being held.
3. No relationship effect is active until a verb modifies the aim-owned noun.
4. Holding a verb while aiming toward another candidate does not silently retarget the active relationship.
5. Releasing the verb and deliberately redirecting aim releases the old noun, then acquires the new noun through the state sequence.
6. Looking into empty space releases held attention after bounded grace.
7. No generic persistent lock ring returns.
8. K/K1 movement and L verb grammar remain unchanged.

## Validation
`npm run validate:current` passes:
- HC031M source/contract/runtime targeting validator.
- HC031M JS syntax checks.
- RecipeDataSystem load validation.
- undefined `this.method()` audit.
- 14 neighboring-owner hashes.

The validator includes a runtime proof with a centered normal noun and an off-axis absorbable noun: aim owns the centered noun; Absorb cannot steal it; an active verb cannot retarget it; deliberate camera redirect then produces RELEASED -> CANDIDATE -> ENGAGED -> HELD on the new noun.

Production Vite bundling cannot be verified in this Linux container because the uploaded Windows-oriented `node_modules` does not contain Rollup's optional `@rollup/rollup-linux-x64-gnu` package. This is the same environment/dependency limitation as prior passes, not a new HC031M source-validation error.
