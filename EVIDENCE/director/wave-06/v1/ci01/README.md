# CI01-P1 hosted verification

The initial hosted run verified the exact CI01-I1 candidate tree. Ubuntu 24.04 installed the locked dependencies and built all 541 outputs. The maintained Vascular fixture could not read its pinned CH03 commit because checkout fetched only the tip. LS1E1 and LS1E2 were each classified by their existing signatures.

The authorized candidate branch was then fast-forwarded by one workflow line, fetch-depth 0. The same draft pull request against the Director foundation triggered a successful rerun. It executed Node v24.14.0, passed all 245 maintained tests, 11 PI02 cases, three scenario cases, nine supplemental checks and the production build, and reproduced the two baseline exceptions. No test was disabled or reclassified. The workflow has read-only contents and suppresses persisted checkout credentials.

The hosted checkout was 2503f3f054710a36b5e0dc549e6abc3c21ba0416. Its full Git tree matched the follow-up candidate 16c676554bae973c16d4274c1b40c34dce3a0998. Its build matched byte-for-byte the original Windows verification.

The exact ZIP was retrieved and its SHA-256 matched GitHub metadata. The artifact is configured for fourteen days. The archived summary remains available after the hosted link expires.

[Initial run](https://github.com/vrocchino45-eng/BLOB-HOST-CORE/actions/runs/45545523201) · [Successful run](https://github.com/vrocchino45-eng/BLOB-HOST-CORE/actions/runs/45546414488) · [Hosted ZIP](https://github.com/vrocchino45-eng/BLOB-HOST-CORE/actions/runs/45546414488/artifacts/14991841025) · [Durable summary](final-summary.json) · [One-line correction](history.patch)
