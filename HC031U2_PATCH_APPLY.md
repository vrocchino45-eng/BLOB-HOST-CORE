# HC031U2 Patch Apply

Parent required: **HC031U1 — Gathering Ground Alive Pass 1 / Startup Lifecycle Hotfix**.

Extract/copy the HC031U2 delta directly over the HC031U1 project root and allow matching files to overwrite.

This is a changed-files-only overlay. Do **not** delete existing project files. No `node_modules` are included.

After applying:

- `package.json` → version `0.31.50`
- `src/main.js` → build `HC-031U2`
- telemetry → `blob.session.telemetry.v1.48`
- Gathering Ground HUD → `LIFE ... · LOOP ... · MEM ...`
