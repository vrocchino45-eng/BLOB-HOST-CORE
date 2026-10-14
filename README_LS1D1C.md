# LS1D1C Camera Aim / A Lock — experimental changed-files patch

Baseline: user-uploaded `HOST-BLOB-Core LS1D1B.zip`. Copy `src/` into the same project root, replacing only two files. Run `node scripts/validateLS1D1CCameraAim.mjs` after copying `scripts/`.

- Hold LT/Stabilize: open camera-centered corner reticle; right stick steers the camera.
- With a centered existing TargetingSystem candidate, press A: explicit target ID is recorded; reticle tightens and changes color. A again while Stabilize is held releases the ID.
- The `frameState.cameraAimLock` telemetry includes candidate ID, aim dot, lock ID, event sequence, and reason.
- DeliberateCommitmentSystem ignores A while Stabilize is held, avoiding *that* particular commitment conflict.

**Limits:** This is a targeting foundation, not an integrated debris grip. Existing TargetingSystem still controls its old automatic attention/relationship behavior; no guarantee other A consumers ignore aim-mode A. The candidate registry currently excludes some Pulse debris. No claim that a fragment can yet be gripped, moved, or absorbed through this lock. The camera overlay requires the camera to be attached to the scene (usual Three.js setup). A lock is retained after releasing LT until explicitly released or the target disappears.

Validation: syntax and static contract only. Full Vite build not run in this environment because the uploaded node_modules lacks Linux Rollup native dependency. Test on the user's development machine before treating as accepted.
