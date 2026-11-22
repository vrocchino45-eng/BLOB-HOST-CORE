# Repository reconciliation

Target: `vrocchino45-eng/BLOB-HOST-CORE`. GitHub reports public visibility and `main` as default. The live check used `git ls-remote` without fetching or mutating cached refs. All 29 remote heads matched their cached tracking tips. No remote tags were advertised.

| Branch | Local head | Verified GitHub head |
|---|---|---|
| feature/f1-flow-silt-circuit | d7517ee78361bed2c50dc726472b9a2aa099331a | absent |
| integration/wave-1 | d7517ee78361bed2c50dc726472b9a2aa099331a | d7517ee78361bed2c50dc726472b9a2aa099331a |
| CONNECTION-61 | 26e8cda5e8237252a822cba271849076252da1da | 26e8cda5e8237252a822cba271849076252da1da |
| main | 0bf8ec000d5a8ce0b322713a0dca08f52de25050 | 0bf8ec000d5a8ce0b322713a0dca08f52de25050 |
| feature/w1-verb-interaction | Local advance excluded | c9e9370d8f8d96e462547e80faf218d412d4a9fa |
| BLOB-BOT0 | Local advance excluded | 9ce089355a808b1418277e11530cdd12780582a3 |

The two local advances were excluded from WC01. The admitted source branch was local and shared its parent with `integration/wave-1`. The source checkout and project refs remained unchanged.

All 33 admitted overlays are local working files relative to the shared committed base. The 19 tracked modifications cover boot and runtime wiring, input, camera-related presentation and targeting, radial accounting, contact and route systems, Hub and return guidance, territory, telemetry/census, and HUD/status presentation. The 14 untracked files are nine focused test files and five F1, Near World, contextual label or crest source files. Their exact paths and raw hashes are in the overlay manifest. The new coordination records are a separate, uncommitted documentation set.

[Full live ref comparison](../manifests/repository-reconciliation.json) · [Exact admitted paths and hashes](../manifests/working-tree-changes.json) · [Publication plan](BASELINE_PUBLICATION.md)
