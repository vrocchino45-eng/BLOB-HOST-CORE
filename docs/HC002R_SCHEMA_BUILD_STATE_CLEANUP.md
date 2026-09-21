# HC-002R — Schema + Build State Cleanup

## Purpose

HC-002R fixes issues discovered during inspection of HC-002Q.

## Fixed Issues

### 1. Missing bond recipe

Added:

```text
flow_bond
```

Used by:

```text
flux_current_ribbon_001
pressure_fold_current_001
```

### 2. Missing chemical domains

Added:

```text
inorganic
confluence
```

These domains were already referenced by local cells and the seed-signal bridge, so the registry now matches authored content.

### 3. Stale build metadata

Updated runtime and build manifest to HC-002R and moved the next recommended gameplay pass to:

```text
HC-002S — Bloom Residue Arrival Stabilization
```

### 4. Placeholder expiration visibility

The placeholder validator now produces a status report with active/expired placeholder counts. Expired placeholders are warnings, not fatal errors, because the prototype still intentionally uses recipe-composed placeholder visuals.

### 5. Schema validation report

RecipeDataSystem now verifies:

- local-cell chemistry domains
- chem-object domains
- chem-object bondTypes
- chem-object visual recipe links
- chem-object placeholder links
- entity/orbiter chemistry domains

Any missing domain or bond now fails validation instead of being skipped.

## Lock Rule

No new gameplay scope was added. This is a data/truth cleanup pass only.
