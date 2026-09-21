# HC031G Build Report — Stabilized Projection / Focused Pulse V1

## Purpose

Make the existing HC029C `Stabilize + Pulse = cohere_project` chord own focused projection everywhere. Surface anchors may improve recoil transfer and concentration, but they never unlock the ability.

## Runtime law

**Stabilize + Pulse -> self-braced focused projection -> optional authored Host brace -> material-dependent force transfer**

The player owns the chord. The environment changes its expression.

## Implemented

- Added `StabilizedProjectionSystem` as the bounded expression owner for `cohere_project`.
- Free-space focused Pulse is always available with no retained target and no surface anchor.
- Three free travel tendrils spread into a self-braced counter-force triad while the chord is held.
- If authored suction anchors are sealed, the same projection reads adhesion, load tolerance, Pulse transmission, and anchor count.
- Scar, membrane, soft tissue, and residue therefore reinforce the same function by different amounts rather than granting different abilities.
- `ChemObjectSystem` can focus along camera-forward when no retained target exists; TargetingSystem remains unchanged.
- Ambient Pulse inquiry remains present but is deliberately weaker while the stabilized projection concentrates forward.
- Focused Pulse VFX changes from a purely radial sphere to an elongated forward projection.
- Sealed surface tendrils visibly tighten/flatten under projection brace load.
- Host Contact Shelf continuation language now names this proof as stabilized projection rather than anchored-only Pulse.

## Authority boundaries

Unchanged owners:

- `VerbCompositionSystem` still defines `cohere_project`.
- `TargetingSystem` still owns retained relationship/candidate logic.
- `PlayerMovementController` still owns translation.
- `CoreSurfaceTruthSystem` still owns authored local contact truth.
- `BondSystem` still owns intact-object Absorb relationships.
- Grave II, rupture, progression, Core growth, and route systems are unchanged.

No new input, collider, hard gate, ability slot, or targeting cycle is introduced.

## Bounded force-transfer proof

HC029C keeps `cohere_project` controlled rather than simply stronger than raw Pulse. HC031G redistributes that controlled output:

- free self-brace: strongest concentration relative to ambient, but not higher raw force than ordinary Pulse;
- weak residue: external support improves the same projection modestly;
- stable membrane: better external transfer;
- dense scar: strongest first-proof brace and may carry slightly more focused force than ordinary raw Pulse;
- all values remain capped to prevent a hidden super-move.

## Validation

- HC031G contract validator: PASS
- RecipeData load: PASS
- undefined `this.method()` audit: PASS
- runtime JavaScript syntax sweep: PASS
- JSON parse sweep: PASS
- relative-import audit: PASS
- 18 parent owners byte-locked
- production Vite render not run because `node_modules` is not packaged in this checkpoint
