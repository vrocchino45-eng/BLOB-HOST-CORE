# HC-031C1 Build Report — Fragment Harvest Handoff

**Build ID:** HC-031C1  
**Parent:** HC-031C  
**Telemetry:** `blob.session.telemetry.v1.25`

## Failure reproduced from playtest
HC031C successfully ruptured objects into pieces, but loose pieces could fail to become the practical Absorb target because older Grave focus boosts remained stronger than the new fragment field. The original short capture windows compounded the problem.

## Correction
- `TargetFocusRegistry` now grants live rupture fragments temporary equal focus priority only while Absorb is held.
- Legacy Grave object boosts are suppressed during that harvest moment, then restored immediately when Absorb is released.
- `TargetingSystem` remains the chooser among fragments; no direct target assignment was added.
- `BondSystem` remains the sole absorb authority.
- Capture windows: echo ~7.6s+, brittle ~9.0s+, silt ~11.2s+.

## Validation
- HC031C1 behavioral/contract validation: PASS
- RecipeDataSystem loadAll: PASS
- undefined `this.method()` audit: PASS
- JS syntax: 119/119 PASS
- public JSON parse: 460/460 PASS
- locked HC031C runtime owners: 114/114 PASS
- exactly five intentional runtime-source differences from HC031C.

Production Vite render is not claimed unless dependencies are locally installed; live browser/controller play remains visual authority.
