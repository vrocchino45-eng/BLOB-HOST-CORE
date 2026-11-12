# BLOB: HOST CORE — CORE-READ1

November 9, 2026. Mode: Core presentation audit and narrow HUD correction. Use on the current accepted SILT-MODE1 baseline. No game systems or progression rules change.

## Install

Extract this ZIP in the BLOB-HOST-CORE project root, then run in PowerShell:

```powershell
Expand-Archive -LiteralPath .\BLOB_CORE_READ1_DELTA.zip -DestinationPath . -Force
node .\APPLY_CORE_READ1.mjs
```

Reload the game. The installer checks the exact prior HUD source, verifies the payload, saves a backup and refuses unknown/later edits. Applying twice is safe.

```powershell
node .\APPLY_CORE_READ1.mjs --check
node .\APPLY_CORE_READ1.mjs --restore
```

## Result

Core inspection and Core Work now name the structure and distinguish the displayed architecture from its progression ceiling:

| State | Readout |
| --- | --- |
| Normal starting architecture | 3-phase · one per function · base |
| Six-phase at the earned six-phase ceiling | 6-phase · two per function · earned |
| Six-phase displayed while only three is unlocked | 6-phase · two per function · debug preview |
| Twelve-phase displayed while only six is unlocked | 12-phase · four per function · debug preview |

The same formatter supports a future earned twelve-phase publication, but earned twelve-phase content is still unimplemented. The O preview key remains available. The label reads the existing progression ceiling; it does not grant or authenticate credit, add persistence or distinguish how a supplied test checkpoint was obtained. Automated fixture credits can therefore produce the same label as ordinary progression. Normal players reach it through existing goal completions.

## Audit findings and scope

Existing Core geometry already enables three, six or twelve firing nodes. At six, each root function has two counterpart positions on its existing plane. The architecture-change bloom was active approximately 0.085 active seconds after the fixture unlock and was expired in the later sample. No geometry or bloom correction was justified by this pass.

Rendered inspection views show the paired nodes, but orbiting and transparency can overlap them at other angles. The sampled minimum projected node-center separations were approximately 14 pixels in six-phase inspection and 34 pixels in six-phase Core Work at 960×540. These are samples, not a guaranteed visibility bound or a pixel-level occlusion test. Twelve-phase preview was denser; its readability is not accepted by this pass.

The HUD previously named the architecture without distinguishing earned and preview states. That concrete ambiguity is corrected in one production file: src/ui/PlaytestHudSystem.js. It adds no HUD outside the existing inspection/Core Work readout. Function count describes engine phases, not a new regional geometry or ecology claim.

Purpose: make the existing upgrade understandable. Allowed scope: actual renderer inspection, phase-node sampling, and the existing Core HUD wording. Locked: Core sequencing, progression credits/thresholds, geometry, camera controls, player motion, verbs, chemistry, audio, material ownership, Guide, accepted regional goals and return crossings. Delete targets: none. Temporary test exposure is confined to intercepted development main.js and ends when the browser closes; no diagnostic hooks ship in production.

Six-phase remains a sequencing/presentation architecture without a newly implemented chemistry, endurance, or stability benefit. Human confirmation of the Silt II round trip and SILT-MODE1 remains accepted. This pass does not ask for repeating that journey.

## Validation

- Eight formatter cases passed, including earned/preview distinction, lower debug selection, unavailable publication and read-only input handling. Twelve-phase earned coverage is a supplied contract only.
- Seven installer checks passed: base check, exact apply/backup, repeat application, exact restore, preservation of later edits on apply/restore, and corrupt-payload refusal.
- Running browser exercised normal F inspection, G Core Work, Q Stabilize, O preview and F world return. Three/six/twelve active node counts matched their architectures. Earned and preview wording appeared in the live HUD. No recorded JavaScript or console errors.
- The browser supplied a controlled six-credit checkpoint to test progression consumption and rendering. It did not newly earn goals. Camera views were allowed to settle; no claim of a rigorously locked pose/time comparison is made.
- Production Vite build passed with the existing large-chunk warning. Exact Three.js 0.179.1 and Vite 7.1.0 were used; full transitive dependency-lock parity remains unestablished locally.
- Source hashes for the ten previously audited gameplay/presentation owners match PHASE2-CLOSE1. Only the HUD file changes. Existing material/goal/mode regression evidence is retained rather than rerunning unrelated tests for a text-only change.

Evidence includes formatter and installer results, browser state/node samples, build output, source hashes and the exact diff. Screenshots were used internally only and are not included. Test scripts use the audit folder layout and are evidence, not normal startup imports.

## Next boundary

Keep this accepted journey baseline. Before adding mechanical six-phase benefits, define the concrete physiological effect, owning system, resource tradeoff and observable recovery/failure behavior in a separate chemistry contract. Do not infer those mechanics from calmer visual precession or indicated RPM, or automatically begin Phase III/IV content.
