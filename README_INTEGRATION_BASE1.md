# BLOB-INTEGRATION-BASE1 — installed integration input export

## Why this is the next gate

Pure helper, release and camera-selection fixtures now pass within their documented scopes. Full installed-build integration still lacks the actual dependency declarations/lockfile and authored /data recipes. The source subset alone cannot establish installed dependency parity, recipe values or complete input -> route.update -> material ownership timing. This pass captures those inputs before a gameplay edit. The intermittent Silt disappearance remains open and reproduction is deferred.

## Run once in the existing repository

Copy EXPORT_BLOB_INTEGRATION_BASE.mjs into the BLOB-HOST-CORE repository root. In VS Code PowerShell, from that same root, run:

```powershell
node ./EXPORT_BLOB_INTEGRATION_BASE.mjs
```

The command writes a new BLOB_INTEGRATION_BASE_<number>.zip next to package.json and prints its exact path. Upload that ZIP. It does not install packages, execute game code, modify production files, access the network or collect node_modules/media. It creates no gameplay patch.

CAPTURED means the export found source, a package declaration, at least one lockfile, authored JSON and literal local code imports. It does not mean those files are mutually compatible or that the game passed runtime validation. INCOMPLETE lists missing inputs; upload that ZIP anyway so the gap can be diagnosed without guessing. A missing installed Three.js version is recorded as null.

## Contents and limits

Included: src files (excluding recognized backups/logs/archives), literal project-local code imports referenced from those sources, package.json, available supported lockfiles, index.html, named Vite config files, and JSON beneath public/data or data. A manifest records SHA-256 hashes, byte counts, Node version and installed Three.js version when readable.

Excluded: node_modules, media outside src, hidden files/directories, symlinks, recognized source backups, archives and logs. JSON data contents can include custom authored text; this is a project-file export. Review the ZIP if the repository contains unrelated private material. No .env files are selected. Custom server/data layouts, nonliteral imports and symlinked code can require additional inputs; the export does not claim full repository completeness. The selected uncompressed input cap is 128 MiB. A unique output filename preserves previous exports.

## Validation completed here

Node syntax passes. Controlled fixture validation checks the correct-directory guard, package/lockfile/data discovery, inclusion of a referenced root adapter, standard ZIP CRC integrity and matching SHA-256 hashes. The fixture export is test data and is not included as user-build evidence. Installed execution remains pending.

## Pass contract

Mode: Audit / Convergence.

Purpose: capture the installed integration inputs before claiming full environment parity or changing the Silt route.

Allowed scope: additive export utility and read-only project snapshot with a new manifest/ZIP.

Forbidden scope: dependency installation/upgrades, production modifications, gameplay changes, rendering experiments, renumbering history and expanding features.

Locked systems: all current gameplay and authored data; Guide C1 fix; movement, camera, controls, audio and material ownership laws.

Delete/disable targets: none. Existing diagnostic wrappers are cleared through a fresh browser reload when returning to play.

Visual/feel targets: existing game preserved. No playthrough or disappearance reproduction is requested.

Acceptance: uploaded snapshot includes actual source, dependencies and authored data; missing inputs remain explicit. Then integration can compare source hashes and dependency versions before running full route tests.

Regression: snapshot utility does not change production bytes or overwrite prior exports. Existing passing checkpoints retain their original scopes; no repeated identical tests are requested.

Next: verify the exported environment, load the actual Silt recipe and normalize input through the complete route orchestration, inspect ownership reconciliation and report any concrete failure. Browser/human acceptance remains separate from command-line integration.
