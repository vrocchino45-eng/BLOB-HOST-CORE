# Connection 61 — v7.7 Runtime handoff

**Mode:** external runtime execution handoff; no production changes.

## What was checked here
- Confirmed the checkout's `package.json` declares Vite-based `dev` and `build` commands.
- Searched local file trees and npm cache for installed `three`/`vite` packages; none were found.
- Preserved the v7.6 checkpoint-aware and undefined-method gates unchanged.
- Prepared a Windows PowerShell runner that records environment and gate results, optionally runs `npm ci` on the user's machine, and writes logs to `runtime-results/`.

## How to run
Extract this package anywhere. In PowerShell:

`powershell -ExecutionPolicy Bypass -File .\RUN_ON_WINDOWS.ps1 -GameRoot 'C:\path\to\BLOB-HOST-CORE' -Install`

The `-Install` switch is optional if `npm ci` has already completed. The script modifies `node_modules` only when `-Install` is supplied; it does not edit source files. Upload the generated `runtime-results` folder or ZIP. Python 3, Node and npm must be installed. If the game root is a nested folder, use the one containing `package.json`.

## Status
Real Three.js execution, Vite build and Grave entry/exit remain **not verified in this environment**. Do not merge the experimental ownership code yet. Production Connection 61, historical checkpoints and FLOW/LS1 are unchanged.
