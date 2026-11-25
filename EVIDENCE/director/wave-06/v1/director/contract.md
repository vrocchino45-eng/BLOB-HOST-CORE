# DL-F02-C1 compatibility contract

Exact source is the Git HEAD of the executing checkout. The gameplay authority is the scenario’s pinned checkpoint. The checkout must contain that checkpoint in its ancestry and match its authoritative fingerprint.

The gameplay fingerprint hashes a versioned Git tree inventory containing file modes and blob object IDs for src, public, index.html, package metadata and lockfiles, and relevant root Vite, environment and build configuration. The launcher also verifies that the actual working input bytes match the tracked blobs, and rejects local or ignored gameplay overrides. Runtime dependency versions come from the pinned lockfiles.

The tooling revision independently hashes the Director programs, scenario files, the shared source-identity module and the Bot dependency lock. The scenario schema, revision and expected checkpoint remain explicit. Revision one continues to require PI02 authority. IN01 revision two requires only the expressly verified PI03 authority. An unknown revision, an invalid identity, foreign ancestry, and an altered gameplay fingerprint produce separate diagnostics.

The 11-file Wave 04 overlay was first reconstructed at 5988bcd7f1fe247e9dcea7ce04ab745a18689483 after checking every original file hash. Seven independently listed compatibility files were then committed at bd8622941baac6fc74cc09f47438d205862bb053. All 541 production outputs matched the Director foundation. Headed load, reset, script execution, takeover and the native neutral step passed. Ordinary storage stayed isolated, and the 12 mounted comparisons matched the accepted record exactly.

Native audio was captured without changing gain or gameplay timing. Some requested frames never reached the encoded streams. Mechanical and visual evidence are available. The 100 ms target and real-time Experience remain open.

[Exact runtime identities](exact-identities.json) · [Promotion](promotion.json) · [Patch](compatibility.patch) · [Capture alignment](capture-mapping.json)
