from pathlib import Path
import hashlib, shutil, sys
root=Path(__file__).resolve().parent
target=root/'src/ecology/OrbiterSystem.js'
expected='3476d85ca30f5b7869a512dc581391cce7cd9f0cf45c3e45c34f2f6af1e46852'
if not target.is_file(): sys.exit('STOP: missing src/ecology/OrbiterSystem.js. Extract into repository root.')
actual=hashlib.sha256(target.read_bytes()).hexdigest()
if actual!=expected: sys.exit(f'STOP: source hash differs (expected {expected}, found {actual}). No changes made. Upload current file for rebase.')
s=target.read_text(encoding='utf-8')
old='''    orbiter.root.scale.setScalar(scale);
'''
new='''    // GSL-4E2E: layered expression. The authored owner retains ALL position,
    // target, state, rotation, Core Work, and pulse decisions above.
    // Expression is a smoothed, reversible local silhouette deformation only.
    const expressionMode = gslEnabled && !coreWorkActive && this.gsl4e2dPending?.selected
      ? this.gsl4e2dPending.mode : "companion";
    const expressionTarget = expressionMode === "concern" ? 1 : expressionMode === "support" ? -1 : 0;
    if (!Number.isFinite(orbiter.gsl4e2eExpression)) orbiter.gsl4e2eExpression = 0;
    const expressionRate = expressionTarget === 0 ? 4.8 : expressionTarget > 0 ? 11 : 6.5;
    orbiter.gsl4e2eExpression += (expressionTarget - orbiter.gsl4e2eExpression)
      * (1 - Math.exp(-Math.max(0, Math.min(dt, 0.1)) * expressionRate));
    const expression = orbiter.gsl4e2eExpression;
    // Concern contracts/heightens; support broadens/softens. Neutral is exactly 1:1:1.
    orbiter.root.scale.set(scale * (1 - expression * 0.12),
      scale * (1 + expression * 0.075), scale * (1 - expression * 0.085));
    frameState.gsl4e2eDebug = {
      enabled: gslEnabled, selectedMode: this.gsl4e2dPending?.mode ?? "companion",
      expressionMode, expressionWeight: Number(expression.toFixed(3)),
      expressionApplied: gslEnabled && Math.abs(expression) > 0.015,
      movementOwner: frameState.gsl4e2dDebug?.finalOwner ?? "original_guide",
      coreWorkProtected: coreWorkActive
    };
'''
assert s.count(old)==1, 'STOP: expected scale location not unique'
s=s.replace(old,new)
backup=target.with_name('OrbiterSystem.js.GSL4E2E.bak')
if backup.exists(): sys.exit('STOP: backup already exists. No changes made.')
shutil.copy2(target,backup)
target.write_text(s,encoding='utf-8')
print('PASS: GSL-4E2E expression-only patch installed. Backup:',backup)
print('GSL OFF at startup. Toggle Ctrl+Shift+F9. Inspect frameState.gsl4e2eDebug in runtime.')
