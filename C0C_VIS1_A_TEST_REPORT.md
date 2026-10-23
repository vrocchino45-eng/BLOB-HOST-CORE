# C0C-VIS1-A — Validation report

**Scope:** single guarded route-owner patch after TRACE1-B; new output remains in the existing REC1 presentation trace. One existing gameplay file will be modified upon the user's explicit local `--apply`; no existing files overwritten by extraction.

| Check | Result |
|---|---|
| Audited TRACE1-B route before SHA | `0399843208349c4a6315d4b339f3bc71de859594c0dc07b376a0f6f89cac385d` |
| VIS1-A exact source after SHA | `fb2c6897ea68b02b3cfe6f4f37b7e6ff11d5a80bf0da08a42f2eb18d250b9cbb` |
| Explicit replacement anchors | 6 unique anchors; reverse reconstruction byte-identical to TRACE1-B |
| Mock owner tests | `OFFLINE_PRESENTATION_AND_OWNER_ISOLATION_PASS` — 3,034 assertions |
| Zero load | Strict no-op for meshes and materials |
| Real THREE.Mesh/THREE.MeshStandardMaterial smoke test | `REAL_THREEJS_MESH_PRESENTATION_SMOKE_PASS` |
| Reference load 0.5252 | Mean compression in real mesh smoke test: 0.13352 (13.35% in local fold radial scale) |
| Scene-state bounds | Compression ≤ 0.26; Y expansion ≤ 0.33; opacity ≤ 0.48 for folds |
| New-receipt wave and recovery | Test pass (local animated age and decline with load) |
| Guarded apply / no-force / revert | Pass; exact original hash restored; modified owner rejected |
| Older TRACE1-B REC1 JSON | Correctly returns `INCOMPLETE_NO_VIS1_SAMPLES` (102 old presentation samples, no invented VIS1 values) |
| Synthetic analyzer test | Reports VIS1 traces and loading/recovery ranges correctly |
| Node syntax (`node --check`) | Pass |
| Full Vite build in this Linux sandbox | **NOT VERIFIED**: supplied Windows node_modules missing Linux-native Rollup optional binary |
| Local Windows browser, controller and perceptual field proof | **PENDING** |

VIS1 neither changes `VascularSiltSignalReceiver.js` nor Silt, ledger, movement, current force formula, chemistry, save/persistence, progression, gameplay verbs, targeting or region transitions. The new anatomical expression is rendered only after existing presentation drivers have run, and its applied scene values are published to TRACE1-B.
