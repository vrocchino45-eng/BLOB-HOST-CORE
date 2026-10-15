# LS1D1D1 — Silt Camera Target Convergence

**Base:** LS1A-Silt-Habitat-Foundation with LS1D1D0 already applied. Copy these files into the same paths at project root. Commit before applying.

- Stabilize (LT) finds an eligible *visible living Silt material unit* within the existing 2.2-unit grip range, based on camera alignment (dot >= 0.90). It no longer picks the nearest grain regardless of camera aim.
- Candidate gets a mint open-corner marker; A grips the candidate and the marker turns amber/smaller. A again or LT release drops it. Camera movement does not switch the held unit.
- Publishes `frameState.siltMaterialAim` with candidate/locked/held IDs and alignment for future telemetry. The pre-existing global `cameraAimLock` remains separate; this is route-local convergence, **not** yet unified global ownership or Pulse fragment targeting.
- Does not change Silt ecology population, locomotion, chemistry, camera controls, or the grip range.

Validation: `node scripts/validateLS1D1D1SiltTarget.mjs`, `node scripts/validateLS1D1D0MaterialIdentity.mjs`, `node scripts/validateLS1D1CCameraAim.mjs`.

**Playtest:** Activate living Silt material; find two eligible small grains near Core, hold LT, aim each with right stick, press A; move camera while gripping; press A to release; select the other. Candidate marker should move; held marker should remain amber. Existing large Silt balls/route targets are not all LS1B material units and are not made grippable by this pass.

**Limitations:** Static checks passed; browser/controller gameplay not tested. Aim uses a 0.90 dot threshold and existing grip range. Additional aim tuning and cross-system lock reconciliation may be required. No changes to historical HC build numbering.
