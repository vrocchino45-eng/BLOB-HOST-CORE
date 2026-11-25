# CI01-I1 deterministic verification

Local candidate 5934b4c02dd70b392cd5b730f5dc4503a63430c2 from Director foundation d6b9b8ad13539d3be507c465ea3bb9782c718c9a. Node v24.14.0, npm lockfile digests, SHA-pinned checkout/setup-node/artifact actions. The CI promise includes both source and test verdicts. The Foundation originally pointed some locked tarballs at a private package mirror. A reproducible public install substitutes that URL path only when a locked integrity digest is available, then restores the exact lockfile bytes.

The local final run passed 245 maintained, 11 directed, 3 scenario and nine supplemental checks. Vite emitted 541 files byte-identical to DL-F01-P1. CI retains result JSON and logs for 14 days and uses read-only permission. LS1E1 and LS1E2 signatures are held as baseline exceptions; missing or changed signatures fail validation.

Hosted execution remains unexercised. The initial workflow has no GPU, controller or local audio requirements. It runs for PRs targeting the Director foundation after ordinary review. Manual dispatch becomes available once configured on the default branch. The historical C62 workflow retains its existing role. Pinned browser replay with one neutral input and one receipt fixture is a later candidate once a versioned browser dependency and non-GPU assertions are established.

[Candidate patch](candidate.patch) · [Source manifest](candidate-manifest.json) · [Machine-readable summary](summary.json).
