# HC031T5 Patch Apply

Parent required: **HC031T4 — Gathering Ground Attention Handoff**

1. Stop the Vite dev server.
2. Extract the HC031T5 delta into the project root and allow the files to overwrite matching paths.
3. No files need to be manually deleted.
4. The old duplicate Gathering Ground runtime mesh is removed by replacement of `src/fields/ApertureAdjacentTerritorySystem.js`; it is not a standalone file.
5. Run:

   `npm run validate:current`

6. Restart Vite and confirm the boot identity is:

   `HC-031T5 — Ridge Trace + Canonical Gathering Ground Lock`

Package version: `0.31.46`
Telemetry schema: `blob.session.telemetry.v1.46`
