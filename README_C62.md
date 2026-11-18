# BLOB Connection 62 — automated validation overlay

This package contains **only new automation files**. It does not change game code, checkpoint numbering, historical manifests, or the existing C61 validation scripts.

## One-click Windows
1. Extract this ZIP **into the root of your current BLOB-HOST-CORE project**, where `package.json` exists. Allow folders to merge.
2. Double-click `RUN_BLOB_C62.bat`.
3. Upload the `C62_RESULTS` folder (or ZIP it) after the run.

Requires Python 3 and Node.js/npm. If dependencies are missing, the runner invokes `npm ci`, which installs dependencies from the existing lockfile. It may require internet access.

## GitHub Actions
Commit these same files to your GitHub repository on a branch, then open a pull request. The workflow runs automatically on pull requests and pushes to `main`, or manually from the Actions tab using **BLOB Connection 62 validation**. Download the `BLOB-C62-validation-...` artifact from the workflow run.

The workflow uses Windows, Node 22, Python 3.12, `npm ci`, and the existing `runtime-test-v7.8/run_runtime_gate.py`. It does **not** automatically compare your separate local Windows working tree with the archived C61 ZIP. That parity question still requires the local project results or a separate uploaded tree.

## Interpretation
- Exit 0 = gate PASS
- Exit 1 = gate FAIL
- Exit 2 = dependency BLOCKED

The underlying gate checks checkpoint provenance, undefined methods, dependencies and production build. Browser/human gameplay tests are **not** included.

## Safety
Keep `C62_RESULTS/` out of commits; this overlay includes an append-only `.gitignore` snippet instead of modifying your existing `.gitignore`.
