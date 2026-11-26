# GIT01 repository reconciliation

The original feature checkout contained 91 pending files. All 91 were archived byte-for-byte, with the original index, tracked patch and Git history bundle. An independent recovery checkout reproduced the original pending status, index and patch.

| Category | Files | Disposition |
| --- | ---: | --- |
| Active gameplay source | 24 | Exact bytes already present in WC01 ancestry |
| Approved architecture reference | 1 | Saved blueprint registered verbatim |
| Historical development documentation | 8 | Five published exact copies and three archived private variants |
| Construction and planning documents | 47 | Forty-four published exact copies and three archived private variants |
| Test scripts and fixtures | 11 | Exact bytes already present in WC01 ancestry |
| Generated artifacts, temporary files and unknowns | 0 | Existing ignore rules suffice for the reviewed inventory |

The 33 admitted source and focused-test files exactly match the [WC01 gameplay overlay](https://github.com/vrocchino45-eng/BLOB-HOST-CORE/commit/a23981a17e2fbaf5a40c3ec97a06c56d8b555c87). A further 51 pending files exactly match the [published WC01 baseline](https://github.com/vrocchino45-eng/BLOB-HOST-CORE/commit/0f756ffc65d2881ddfe326b8e66347474a0e4659). Six original WC01 variants contain local publication-preparation details. Their approved public counterparts remain in the published history. Exact original variants are preserved locally.

The reconciliation branch starts at the [governing IN01 baseline](https://github.com/vrocchino45-eng/BLOB-HOST-CORE/commit/462f1278ea069b41b4c0216335f4bb9363ee38af). Its changes are documentation only. The file inventory records comparisons to IN01, the scoped PI04 candidate, and the independent UI03 promotion. Later source versions retain their existing lineage.

One original local-only commit was captured in the history bundle. The original feature branch name has no same-named remote branch. Its commit is available as the published integration/wave-1 tip. Original and protected branch names retain their existing targets.

[File classification](file-classification.json) · [Blueprint registration](../../architecture/universal/BLUEPRINT_REGISTRATION.md)
