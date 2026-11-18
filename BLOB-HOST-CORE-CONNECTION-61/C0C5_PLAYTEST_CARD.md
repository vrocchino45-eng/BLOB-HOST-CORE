# C0C5 Field Test Card — Does the invisible circuit actually respond?

**Use with installed C0C2 + C0C3 + C0C4 + REC1.** Target: 6–10 minutes (shorter if fast travel). Gameplay baseline remains LS1E2.

### A. Negative control — no fabricated cross-cell cause

1. Reload to reset runtime-only receipts and start REC1 (`Alt+Shift+R`).
2. In Silt, Pulse in free space and Stabilize/press the garden patch while holding a grain. Record the pressure/imprint if achieved.
3. **Do not deliberately release an unseated grain yet.** Contact presses alone should NOT add `host-silt-cause-observed` / Silt release receipts.

### B. Causal source — make a genuine Host receipt

4. Grip a free Silt grain with LT+A; move it out from its native position; **deliberately release it unseated**. Repeat one or two times, if practical.
5. Check the Silt origin ledger or REC1 for distinct `host-silt-cause-observed` IDs for actual `released-with-trajectory` outcomes. Pure Pulse counts do not count as causes.

### C. Receive and recover — real Vascular-owned response

6. **Without refreshing the game**, travel to Vascular and allow it to mount.
7. Read bottom-right Vascular diagnostics: `receivedTotal` equals the unique accepted source receipts that have become visible to receiver; `sourceReceiptGaps` is zero in an ordinary continuous case; `membraneLoad` > 0; `directionalFlowScale` < 1. Values depend on release speed and time and are NOT fixed targets.
8. Remain inside Vascular for 20–40 seconds. The load must decrease; current multiplier must rise toward 1.0. The native “reweaving X%” progress is a **separate objective** and needn't change.
9. Exit/re-enter Vascular in the same runtime. A previously accepted receipt must not be applied twice. Do not expect off-route ticking.
10. Stop REC1 (`Alt+Shift+R`) and export (`Alt+Shift+E`) before closing game. Take screenshot of Vascular diagnostic, and describe whether you could **feel or see** membrane/current response without reading debug.

### Pass / Fail / Evidence

- PASS: Silt contact pressure behaves as before; only unseated release creates provenance; Vascular receives each valid receipt once; load/current change and recover; no material or progression is conjured; REC1 has zero dropped event details.
- FAIL: receipt without valid Silt release; missed or duplicated accepted receipts; load does not decay while Vascular mounted; current multiplier does not follow load; Silt contact regression; material identity break; browser exception.
- NEEDS VISUAL CONVERGENCE (not C0C4 math failure): diagnostics prove load/current but movement or sound response is too subtle or disconnected.
- Limits: mounted-region visual behavior is separate from the C0C2 math; source 64-entry Silt ring and REC1 sampling may have source-level gaps at extreme input rates. Full retained recorder history alone doesn't guarantee complete source trace.

### Record the results

| Evidence | Value/Observation |
|---|---|
| Build commands passed | |
| Silt contact presses / imprints | |
| Unseated release receipt IDs | |
| Vascular received total / gap total | |
| Membrane load on entry → after wait | |
| Current multiplier on entry → after wait | |
| Duplicate after revisit? | |
| REC1 captured/retained/dropped | |
| Visible/audible feedback (without HUD) | |
| Known issues / screenshots | |
