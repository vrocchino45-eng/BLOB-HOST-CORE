# Wave 03 Director evidence · v1

Build `2f90256a1047b748bf99f7aec39b70b2ed1aeffe`. Parent `8a15b59530733fdccc61118b4d8f14174f49566a`. DL-EXP-001 uses `blob.dev-scenario.v1` revision 1 for all three layouts.

| Evidence | Verdict and links |
| --- | --- |
| Comparative verification | Six passed. [Trials](telemetry/runs.json) · [Acceptance](verification/acceptance.json) |
| Scenario definitions | [Deep](scenarios/deep.json) · [Balanced](scenarios/balanced.json) · [Membrane](scenarios/membrane.json) |
| Regression | 11 PI02, 3 scenario, 245 maintained and 9 supplemental checks passed. 541 build outputs matched. Two reproduced LS1 exceptions. [Exact gates](verification/regressions.json) |
| Review | [Director report](Director-Review.md) · [Metrics](Director-Review.json) · [Synchronization](recordings/sync.json) |
| Review clips | [Identical input](https://github.com/vrocchino45-eng/BLOB-HOST-CORE/releases/download/director-wave-03-evidence-v1/DL-EXP-001-input.webm) · [Identical objective](https://github.com/vrocchino45-eng/BLOB-HOST-CORE/releases/download/director-wave-03-evidence-v1/DL-EXP-001-objective.webm) · [Asset manifest](recordings/manifest.json) |
| Engineering | [16-file candidate manifest](candidate/manifest.json) · [Exact patch](candidate/Director-Wave-03.patch) · [Architecture and coordination](architecture/) |
| Full local archive | [Logical member index and checksums](archive/index.json) |

Both comparison exports are silent. The recordings support visual review. Real-time Experience and gameplay acceptance are separate gates. The raw accepted source clips and full archive remain on E:.
