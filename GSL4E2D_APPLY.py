from pathlib import Path
import hashlib, shutil, sys
root=Path(__file__).resolve().parent
# Script is extracted into project root; locate target relative to itself.
target=root/'src/ecology/OrbiterSystem.js'
expected='a49585df7b1f307db5282df050d424ae809837aa3b2ebd5e6bc0c3f76c58b0b2'
if not target.exists(): sys.exit('STOP: src/ecology/OrbiterSystem.js not found. Extract ZIP into BLOB project root.')
s=target.read_text(encoding='utf-8')
actual=hashlib.sha256(target.read_bytes()).hexdigest()
if actual!=expected: sys.exit(f'STOP: source hash mismatch. Expected {expected}, found {actual}. No changes made.')
old='''      frameState.gsl4e2bDebug = { enabled: true, mode: gsl.mode, event: gsl.event, authoredOverride: authored };
      const report = `${gsl.mode}|${gsl.event}|${gsl.active}|${gsl.reason}|${authored}`;
      if (report !== this.gsl4e2cLastReport) {
        this.gsl4e2cLastReport = report;
        console.info("[GSL4E2C]", { mode: gsl.mode, event: gsl.event, attached: gsl.active, detachReason: gsl.reason, authoredOverride: authored });
      }
'''
new='''      // GSL-4E2D: report selection and ownership separately; no gameplay changes.
      const ownerReasons = [];
      if (coreWorkActive) ownerReasons.push("core_work");
      if (shimmerActive) ownerReasons.push("authored_shimmer");
      if (guideTarget !== "player") ownerReasons.push(`authored_target:${guideTarget}`);
      if (pulseT > 0.05) ownerReasons.push("pulse_response");
      const owner = authored ? "authored_guide" : "companion_available";
      const selected = gsl.mode === "concern" || gsl.mode === "support";
      const provisionalApplied = !authored && selected;
      frameState.gsl4e2bDebug = { enabled: true, mode: gsl.mode, event: gsl.event, authoredOverride: authored };
      this.gsl4e2dPending = {
        mode: gsl.mode, event: gsl.event, attached: gsl.active,
        detachReason: gsl.reason, selected, provisionalApplied,
        owner, ownerReasons, authoredOverride: authored
      };
'''
assert s.count(old)==1, 'source block mismatch'
s=s.replace(old,new)
needle='''    orbiter.root.position.lerp(targetPosition, Math.min(1, dt * (coreWorkActive ? 5.4 : 3.2)));'''
insert='''    // GSL-4E2D: resolve AFTER pulse's final state override. Observe only.
    if (gslEnabled && this.gsl4e2dPending) {
      const d = this.gsl4e2dPending;
      const expectedState = d.mode === "concern" ? "gsl_concern" : d.mode === "support" ? "gsl_support" : null;
      const applied = Boolean(d.selected && expectedState && state === expectedState);
      const finalOwner = applied ? "gsl_response" : (state === "answering_player_pulse" ? "pulse_response" : d.owner);
      const suppressionReason = !d.selected ? "no_active_gsl_response"
        : applied ? "none"
        : state === "answering_player_pulse" ? "pulse_final_override"
        : d.ownerReasons.join(",") || "final_state_not_gsl";
      const diagnostic = {
        event: d.event, selectedMode: d.mode, selected: d.selected,
        applied, finalGuideState: state, finalOwner,
        authoredOverride: d.authoredOverride, ownerReasons: d.ownerReasons,
        suppressionReason, guideTarget, attached: d.attached, detachReason: d.detachReason
      };
      frameState.gsl4e2dDebug = diagnostic;
      const report = JSON.stringify(diagnostic);
      if (report !== this.gsl4e2cLastReport) {
        this.gsl4e2cLastReport = report;
        console.info("[GSL4E2D]", diagnostic);
      }
    } else {
      frameState.gsl4e2dDebug = { enabled: false, applied: false };
    }

'''+needle
assert s.count(needle)==1
s=s.replace(needle,insert)
# clear stale pending before guide update and stale reports on toggles
s=s.replace('''    const t = frameState.runtimeSeconds;
''','''    this.gsl4e2dPending = null;
    const t = frameState.runtimeSeconds;
''',1)
backup=target.with_name('OrbiterSystem.js.GSL4E2D.bak')
if backup.exists(): sys.exit('STOP: backup already exists; no files changed. Inspect before retrying.')
shutil.copy2(target,backup)
target.write_text(s,encoding='utf-8')
print('PASS: GSL-4E2D ownership diagnostics installed. Original backed up at',backup)
print('GSL remains OFF by default. Toggle Ctrl+Shift+F9; watch [GSL4E2D] console entries.')
