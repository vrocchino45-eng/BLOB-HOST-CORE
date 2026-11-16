# CONNECTION20 — consolidated integration checkpoint

This combines CONNECTION15, 17, 18 and 19 into one guarded update. Production code is exactly the CONNECTION19 build: no new gameplay or sound change is added here. CONNECTION16 was an audit and is not an installation prerequisite. Historical HC/LS1 labels, reports and previous backups remain intact.

## Install

Extract this ZIP into your existing BLOB-HOST-CORE folder beside package.json, then run:

```powershell
node .\APPLY_CONNECTION20.mjs --check
node .\APPLY_CONNECTION20.mjs --apply
```

The installer recognizes complete affected-file sets from CONNECTION14, 15, 17, 18 and 19. You do not need to apply every intermediate patch. It also recognizes an already-installed CONNECTION20. Reload the game after installation.

Affected files and unchanged anchors are checked before writes. Unknown mixtures or edits to affected files are refused. Unrelated files are retained. Exact originals go into CONNECTION20_BACKUP. Restore your actual starting checkpoint with:

```powershell
node .\APPLY_CONNECTION20.mjs --restore
```

Restore refuses subsequent edits. Earlier CONNECTION15/17/18/19 backup folders and historical reports are not replaced or deleted.

## Included repairs

- Hub eligibility no longer depends on whole-junction screen verification. Initial invitation, progression, destination preparation, distance and crossing ownership remain authoritative.
- Grave II supplies its own phase-correct guide, heading and status. Grave I and the unresolved safe return remain intact.
- Controller/keyboard help exposes the existing Core Work entry and mode controls.
- Decorative foreground Silt sediment softens only where it blocks the Core in world view, then restores its exact material. Cavity walls, tunnels, resources, current contact and inspection/Core Work are protected.
- Stabilize's field/tether use world coordinates. A new contact starts its own visual alignment; known material instability drives the existing bands' disagreement without changing repair or completion rules.
- A confirmed positive Silt-to-Vascular pressure effect gets one localized two-note response at the existing tissue wave's first fold. Duplicate, muted/locked, late, Core Work and revisit cases cannot replay an old cue. HC027D1 mix settings remain unchanged.

## Validation and boundaries

RESULTS_CONNECTION20.md records a fresh full-catalog integration pass and focused feature checks. Reports include actual source identities and preserve fixture qualifications. Bot success does not grant human readability, critical listening, physical controller delivery, ordinary-navigation or naturally earned Core Work acceptance.

The plan file retains its historical CONNECTION15 harness label. Production source identity is the authoritative identifier for each run. The harness README adds this consolidation record; production remains byte-for-byte CONNECTION19.

The seven root-level CONNECTION17/18/19 files are optional audit utilities and an old visual comparison fixture. They are not game entry points. No node_modules, build cache or long videos are shipped.

## Pass contract

Mode: integration closeout. Purpose: combine known repairs, verify their shared runtime, simplify installation, and prepare one human check.

Allowed scope: packaging, harness documentation and tests. Locked: all production gameplay, visuals and audio at CONNECTION19; movement/camera, mapping, geometry, chemistry, conservation, receipts, progression, timing and 3→6→12 remain unchanged.

Delete/disable targets: none. Visual/feel target: retain the recent repairs without integration regression. Acceptance: full bot catalog, focused presentation/audio ownership checks, source equality to CONNECTION19, recognized checkpoint installation and exact restore. Human integration targets are in HUMAN_CHECK_CONNECTION20.md.

## Remaining work

Human verification remains open for Hub usability, Grave II instruction clarity, Silt visibility in motion, Stabilize readability, arrival audibility/mix and the Deep-versus-membrane Core Work comparison. The historical whole-Silt disappearance is not declared fixed. Broader material hierarchy, Pulse/Absorb contact response, named-site consequence tracing and additional regional sound replies remain queued.
