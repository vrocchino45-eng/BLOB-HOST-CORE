# BLOB C0E2-B — Local Territory Convergence

**Baseline:** Installed C0E2 compound spatial build with exact source or verified CRLF-only normalization.
**Changes:** Six files: two territory owner files (one new), one additive REC1 observer file, three test files (one new). The four regional route owners, Hub gameplay owner, movement physics controller, and authentic Host circuit are unchanged.

## Install

Extract `BLOB_C0E2B_CONVERGENCE_DELTA` beside your `src` folder inside the existing BLOB-HOST-CORE project. In PowerShell:

```powershell
node BLOB_C0E2B_CONVERGENCE_DELTA/apply.mjs --check
node BLOB_C0E2B_CONVERGENCE_DELTA/apply.mjs --apply
node BLOB_C0E2B_CONVERGENCE_DELTA/validate.mjs
npm run build
```

First check **must** show `C0E2_READY`. `DIFFERENT`: STOP, preserve existing files and reconcile. If it already shows `C0E2B_INSTALLED`, do not apply again. Roll back only an unmodified installation via:

```powershell
node BLOB_C0E2B_CONVERGENCE_DELTA/apply.mjs --revert
```

The installer retains exact source backups inside `backups/`, including original Windows CRLF bytes. `.gitignore` excludes those backups from new commits.

## What to test

Record a 10–15 minute exploration using Alt+Shift+R. Visit Silt's **Porosity Shelf** extended pocket (the lone unvisited C0E2 pocket), then interact with at least one site per region using Pulse, Stabilize, Absorb. Saturate one local site and look for its neighbors to respond. Return to the site: its state should remain within the same browser runtime. Export REC1 with Alt+Shift+E.

C0E2-B telemetry adds `c0e2b-movement-volume-change` and `c0e2b-nearest-unvisited-pocket` events. Original `c0e1-territory-verb-read` events gain `localCircuit` showing six directed local relationships and redistribution/dissipation. These are separate from the Host ledger. The target pocket's geometry is intentionally unchanged until the new movement-volume evidence locates a genuine access issue.

**Known limits:** Offline VM/number tests cannot verify production Three.js appearance, player reachability, performance, or how clearly changes read visually. `npm run build` must be run on Windows. Existing mesh boundaries are non-solid tissue guides, not new terrain collisions. This pass does not implement an external save file or long-term ecology.
