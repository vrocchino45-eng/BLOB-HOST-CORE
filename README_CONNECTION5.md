# BLOB: HOST CORE — CONNECTION5 visual-current trial

November 11, 2026 · Visual Lock / Convergence · Requires CONNECTION3

## Install and verify

Extract this archive into your BLOB-HOST-CORE project root, then run:

```powershell
node .\APPLY_CONNECTION5.mjs
node .\BLOB_BOT_SERIES1\run.mjs --all
```

Reload the game page. No dependency reinstall is required. Upload the new timestamped report folder as a ZIP. The installer requires the expected CONNECTION3 source and suite, recognizes LF/CRLF, and refuses unrelated/later edits. CONNECTION4 was report-only and requires no installation.

Originals are in CONNECTION5_BACKUP. Check with `node .\APPLY_CONNECTION5.mjs --check`; restore exact backups with `node .\APPLY_CONNECTION5.mjs --restore`. Restore preserves earlier reports and refuses unrelated edits. Do not force over a mismatch.

## What changed

The existing 24 Vascular current particles now integrate a route-owned travel phase. Stronger applied coherence slows their downstream travel more; weaker coherence slows it less. Their speed uses the ratio of the actual applied directional calm term to its neutral-coherence counterpart, as published by the same current owner. Presentation does not invent a second Core physiology law.

Changing speed no longer recomputes all earlier travel as `absolute time * current speed`. The phase advances once per mounted route update, using only the existing accepted <=50ms simulation substeps. Render-only calls cannot advance it. Zero/invalid dt cannot travel, and oversized direct calls admit at most one 50ms step. There is no independent wall-clock catch-up.

Fresh route instances seed phase zero plus the existing authored particle offsets. Same-runtime unmount/remount retains phase without hidden advancement or backlog. Return-current direction reversal changes subsequent travel without relocating the phase. The existing looping path can still wrap from end to start; that is distinct from a speed-change jump. Existing lateral wave animation is retained, so the continuity guarantee concerns longitudinal travel, not a frozen whole-scene transform under arbitrary changes.

Only VascularRhythmRouteSystem changes in production. Naming the already-computed physical calm terms and adding their diagnostic timestamps does not alter physical outputs. Particle count, identity and authored offsets remain unchanged. No new emitter, material transport, collider, target, HUD panel, input, reward or receipt channel is added. Physics/coherence coefficients, reserve, goals, timings, movement, camera, audio and progression stay at CONNECTION3 rules.

## Bot coverage and results

- Existing 241 component checks remain passing.
- W04 adds 14 check groups: 72 unique exact pre-patch/current physicalFeel comparisons, actual particle travel/positions, zero-time changes, repeated render safety, reversal/wrap, accepted step sizes, invalid time, hidden/remount/reset behavior, guards and unchanged particle/gameplay identities. Its pre-CONNECTION5 source fixture is read as test text and never runs as a parallel owner.
- W05 adds a browser scenario for actual current → phase → actual particle positions, zero-time coherence changes, reversal, hidden/remount and unchanged material/progression state. Controlled coherence, intent, calm, path, starting phase, completion-direction flag and hidden-clock jump are explicit fixtures. Controlled route fields are restored. This is not a natural placement/goal or perception test.
- Current total: 255 component checks across thirteen groups and five browser scenarios. Prior case IDs, checkpoint numbers and historical reports remain preserved.

All 255 component checks passed. B01/B02/B03/W03 passed in the broader browser run; corrected W05 passed separately at normal and slowed animation callbacks (500ms). B03 retained actual Vascular/Silt publications, mass eight, six credits/six-phase, Hub return and reserve/Core Work. The build passed with the existing large-chunk warning. Seven installer groups passed, including LF/CRLF byte-exact restore, repeat installation and refusal without writes.

The initial browser invocation had a W05 test-fixture error involving uninitialized hidden Silt state; it is retained and is not labelled an all-pass invocation. New W04 fixture/wrap expectations were corrected before its final pass. See EVIDENCE/VALIDATION.json and individual summaries for run boundaries. Source files were unchanged during every recorded test run; scope comparison confirms one production source changed from CONNECTION3.

## Human comparison

CONNECTION3's physics feel has your provisional acceptance and was not retuned. CONNECTION5's visual readability remains pending.

In normal Vascular play, watch the stream while holding/releasing Stabilize and compare Deep versus membrane arrangements using actual Core Work placement controls. Look for a readable speed difference and continuous travel as coherence/effort changes. Keep moving and check that the cue helps explain the response rather than distracting from navigation. Natural surface attachment and whole-camera perceptual clarity are not established by controlled point/phase tests.

No long recording is needed. If a video becomes useful, keep it under 25 minutes.

## Pass scope and closeout

**Project:** BLOB: HOST CORE. **Mode:** Visual Lock / Convergence. **Milestone served:** coherent R3/R4/R5 connections toward R6. **Purpose:** connect the current cue to the applied Core response without changing gameplay tuning.

**Allowed scope:** the existing Vascular current diagnostic and decorative particle travel, affected bot cases and guarded delivery. **Forbidden scope:** new physics/physiology, goals, content, controls, receipt buses or separate owners. **Locked systems:** every other production source plus material, reserve, movement/camera, progression, engine, Host/Silt laws and audio reference. **Files inspected:** mount/unmount/update/animate lifecycle, runtime bounded-substep policy, current calculation and particle readers, existing W cases and full browser arc.

**Delete/disable target completed:** removed absolute-time-times-changing-speed particle travel; only the new route-owned visual phase drives longitudinal particle placement. Experimental baseline source remains test text only. **Implementation tasks:** actual calm-term publication; bounded current ratio; phase integration; render-only consumption; lifecycle/guard/physics and browser checks; installer/build/source-scope checks.

**Visual target:** particles communicate the actual coherence contribution without speed-change relocation or new clutter. **Feel target:** preserve provisionally accepted physics while making its consequence easier to read. **Technical acceptance:** recorded component/browser/build/installer evidence passes within stated fixtures. **Human visual acceptance:** pending. **Regression:** original cases, W01/W02, exact pre-visual physics, B03 route/Hub/reserve arc and source scope. **Notes for next pass:** analyze your reports and visual comparison, resolve any remaining readability/continuity issue, then close the shared connection slice before another verb or region expansion.
