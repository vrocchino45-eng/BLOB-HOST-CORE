# BLOB C0E3-LANG1 — Shared Ability and HUD Language

This is a tiny read-only HUD convergence patch on top of **C0E3 Living Regional Circuit**, plus a documented numerical/lore contract.

1. Extract this entire `BLOB_C0E3_LANGUAGE_DELTA` folder into your `BLOB-HOST-CORE` project root.
2. Run `node BLOB_C0E3_LANGUAGE_DELTA/apply.mjs --check` (must say `C0E3_READY`).
3. Run `node BLOB_C0E3_LANGUAGE_DELTA/apply.mjs --apply`.
4. Run `node BLOB_C0E3_LANGUAGE_DELTA/validate.mjs`.
5. Run `npm run build` on Windows.
6. Optional existing regressions: `node scripts/validateC0E3LivingRegionalCircuit.mjs` and `node scripts/validateC0CRecorderFullSession.mjs`.

On unexpected `DIFFERENT`, STOP. Never force this patch. To roll back an unchanged install: `node BLOB_C0E3_LANGUAGE_DELTA/apply.mjs --revert`.

Only one original gameplay file changes (`src/ui/PlaytestHudSystem.js`); one pure vocabulary module and one test file are new. C0D/C0E2-B/C0E3 math remains unchanged. The patch does NOT implement the proposed Between conductance equations. The full behavior and source math are specified in `BLOB_C0E3_LANGUAGE_CONTRACT.md`.
