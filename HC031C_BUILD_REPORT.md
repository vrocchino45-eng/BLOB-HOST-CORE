# HC-031C Build Report — Rupture Harvest V1

**Parent:** HC-031B — Grave II Resonance Gameplay  
**Mode:** gameplay / combat-language proof  
**Build ID:** HC-031C  
**Version:** 0.31.3  
**Telemetry:** `blob.session.telemetry.v1.24`

## Purpose

Prove a first BLOB-native combat loop without importing hack-and-slash structure: **pressure matter → rupture → released fragment field → partial Absorb harvest → persistent missed residue**.

## Implemented

- Added `GraveRuptureHarvestSystem` as a Grave-II-only owner.
- Added three rupture archetypes in different parts of the second-octave Grave:
  - brittle memory node,
  - residue pressure sac,
  - drifting echo carrier.
- Pulse increases rupture pressure on the retained relationship.
- Stabilize lowers rupture pressure before failure.
- Whole intact rupture objects resist Absorb; they are not pickups.
- Rupture releases four unique soft-bond fragments per object (12 total).
- Released fragments use the existing Targeting + BondSystem + Absorb path.
- Fragment motion differs by material family:
  - brittle shards eject faster and cool at an intermediate rate,
  - silt motes plume slowly and remain harvestable longer,
  - echo flecks scatter/spiral and have the shortest harvest window.
- Missed fragments become persistent, low-hierarchy, non-targetable Grave residue instead of disappearing.
- No combat state blocks the Grave return fold or writes route-progression truth.
- Session telemetry records rupture, collection, and residue events.

## Locked

HC029A/B/C, HC030A/B/B1, HC031A1 spatial octave, HC031B regional resonance, Grave exit safety, Gate/route ownership, canonical controller mapping, and targeting selection logic remain unchanged.

114 HC031B parent source-JS owners are SHA-256 locked.

## Validation

- HC031C behavioral/contract validation: PASS
- RecipeDataSystem loadAll: PASS
- Undefined `this.method()` audit: PASS
- JavaScript syntax: 119 / 119 PASS
- Public JSON parse: 457 / 457 PASS
- Locked HC031B JS owners: 114 / 114 PASS

## Environment boundary

`node_modules` is not bundled in this source package, so a rendered Vite production build is not claimed here. Live browser/controller play remains the visual/feel authority.
