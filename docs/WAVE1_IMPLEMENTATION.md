# Wave 1 — Core Engine initial executable gate

Baseline: CONNECTION-61 C63 / 26e8cda5e8237252a822cba271849076252da1da.

This changed-files-only patch adds a runtime-derived profile regression test to the **feature/w1-core-engine** branch. It tests the real `previewCoreArrangement` path (which calls `CoreRadialPerformanceSystem`) rather than reimplementing the formulas in a harness.

Run: `node scripts/verifyWave1CoreProfiles.mjs`.

Pass conditions: valid 3-piece arrangements produce finite positive modifiers; deep configuration beats membrane on endurance and recovery; membrane beats deep on Pulse charge rate; invalid arrangement rejected.

No gameplay behavior is changed in this initial patch. Do not merge until test passes. Next feature changes must be isolated to owner files and reviewed against this gate.
