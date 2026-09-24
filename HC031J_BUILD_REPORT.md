# HC031J — Build Report

## Pass mode

Visual Lock / Convergence.

## Purpose

Make the existing Pulse, Absorb, and Stabilize intent readable at authored Host contact without adding another gameplay system.

## Why this pass follows HC031I4

HC031I4 telemetry proved the complete membrane → scar → residue sequence, including unsupported attempt, yield, confirmed residue coherence, and presentation-only afterglow. The contact ecology is therefore mechanically sufficient. The next convergence need is clarity: the player should recognize which Core verb is being expressed before interpreting how the material answers it.

## Allowed scope

- presentation-only glyph geometry inside `HostContactEcologyContinuationSystem`
- same-surface validation for attachment-dependent presentation
- read-only telemetry
- build identity, contract, validator, and documentation

## Forbidden scope / locked systems

- movement and controls
- HC029C chord meanings or multipliers
- Pulse, Absorb, or Stabilize output
- surface eligibility, profiles, suction, support plane, or projection mechanics
- targeting, Bond/Absorb ownership, routes, objectives, and progression
- HC031I4 bridge geometry and residue event grammar

## Delete / disable targets

None. The new glyph group is disabled for collision and targeting and replaces no gameplay authority. No second input reader or HUD prompt is introduced.

## Implementation

- Pulse displays a warm outward/downward triangle.
- Absorb displays a cool inverse/inward triangle.
- Stabilize displays a gold coherence ring that wavers without same-surface suction and settles when supported.
- Composed chords display the relevant primitive symbols together.
- Attachment-dependent material presentation now requires the authored suction surface ID to match the active ecology surface ID.

## Visual target

One compact verb symbol over the active surface, with the existing teal/orange/amber material response remaining subordinate and readable beneath it.

## Feel target

The player should read **what the Core is doing** first and **how the Host material answers** second.

## Acceptance tests

- Pulse alone produces the outward triangle on membrane, scar, and residue.
- Absorb alone produces the inverse triangle.
- Stabilize alone produces the coherence ring.
- Stabilize + Pulse retains both primitive reads while HC031I4 material responses remain truthful.
- No glyph appears without a resolved authored contact surface.
- Neighboring-surface suction cannot falsely confirm the active surface.

## Regression tests

- HC031I4 scar-to-residue traversal remains continuous.
- Open residue attempt, closed confirmation, yield, and afterglow still occur under their accepted conditions.
- No movement, targeting, attachment, verb-output, route, or progression behavior changes.
