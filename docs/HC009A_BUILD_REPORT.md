# HC-009A Build Report

HC-009A is the first-slice runtime rebaseline over the frozen HC-008G
compatibility/reference build. It changes runtime ownership, not the authored
progression of Surface Wake, Guide Threshold, or Hub Chamber.

## Implemented

- Added `FIRST_SLICE_RUNTIME_PROFILE_HC009A` as the explicit mount contract for
  the three active rooms.
- Moved the mode controller ahead of region systems so the active room publishes
  its mount before scoped updates run.
- Added lazy initialization, mount, unmount, and settle behavior to
  `SystemRegistry`.
- Limited active region updates to:
  - 15 scoped systems in Surface Wake;
  - 13 scoped systems in Guide Threshold;
  - 8 scoped systems in Hub Chamber.
- Made each room publish one gameplay owner, one presentation owner, and one
  camera profile.
- Converted the Hub to a direct authored first-slice mount instead of a Signal
  Chorus proxy.
- Removed Signal Chorus, Bloom, and Grave compatibility systems from active
  registration and boot.
- Retained all compatibility source and authored data for reference and
  regression use.
- Split recipe validation into a focused first-slice runtime profile and an
  explicit compatibility-archive profile.
- Removed dormant Grave and seam camera overrides from the live camera update.
- Added F1 diagnostics for mount sequence, active owners, scoped budget,
  executed/skipped systems, and dormant compatibility registration.

## Preserved

- Surface Wake Listening Fold, protected-seed, and scar-or-signal triggers.
- Guide Threshold response, traversal, and destination.
- Hub route reads, memory read, return-to-center comparison, and Status
  self-reading ownership.
- ObjectiveSystem completion and GateSystem Grave crossability ownership.
- Vascular Rhythm and Silt Pressure dormancy.
- Canonical keyboard and controller inputs.
- HC-008G presentation behavior as the visual reference baseline.

## Deliberately Deferred

- Core growth, chemistry, nutrient, and ability authority systems.
- New entities, routes, rooms, abilities, combat, and Act 2 content.
- The authored proxy mesh/material pipeline planned for HC-009B.
- The repeatable living nursery circuit planned for HC-009C.

## Verification

- Focused HC-009A runtime-mount integration simulation.
- Focused first-slice source and ownership checks.
- Retained Surface Wake, Guide Threshold, Hub, Status, gate, and input checks.
- First-slice recipe validation.
- Explicit compatibility-archive data validation.
- Undefined-method audit.
- Production Vite build and HTTP smoke test.
- Archive integrity and embedded identity inspection.
