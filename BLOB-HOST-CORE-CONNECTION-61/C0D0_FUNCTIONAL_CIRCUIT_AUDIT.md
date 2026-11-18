# BLOB: HOST CORE — C0D0 Functional Circuit Audit

**Mode:** read-only source audit, contract design, and offline regression; not a gameplay implementation pass.  
**Baseline:** BLOB-COC archive with C0C-VIS1-B presentation applied. `src/routes/VascularRhythmRouteSystem.js` SHA-256: `5359815d616ada933c925dc1740a97a768b68e5c6dc5b56bae27a8e181c192b4` (matches the VIS1-B patch manifest).  
**Audit decision:** PROCEED to C0D1-A, but do not edit existing gameplay until the Vascular event contract is separately tested.

## Purpose

Progress from two active components to three **causally linked** components. Stop tuning cosmetic contrast; retain the current VIS1-B anatomy. Preserve each region's actual owner, existing mechanics, authored identity, and all movement/targeting/progression controls. **The target is a real, inspectable functional network**, not the appearance of connectivity.

## Existing source findings (verified by reading code)

| Domain | Runtime owner / path | Present capability | Current cross-component limit |
|---|---|---|---|
| Silt contact | `src/contact/SiltCompressionContact.js` inside `src/routes/SiltPressureRouteSystem.js` | Local held-grain pressure, brace, imprint; bounded scalar | Pressing the garden patch does **not** emit the Host receipt; deliberate unseated release is a separate decision |
| Silt provenance source | `SiltPressureRouteSystem.recordSiltDecision()` | Publishes accepted `silt-trajectory:released-with-trajectory` decisions to Host ledger | No real cross-region grain transport, chemistry, or remote physical simulation |
| Host provenance | `src/core/HostConnectionReceiptLedger.js` | Validates Silt release, keeps monotonic sequence and bounded history; read-only signal delivered across local-cell mounts | Only Silt release records are accepted; there is no authenticated Vascular-source receipt or Grave destination API |
| Shared behavior | `src/hostCircuit/BoundedAccumulatorBehavior.js` | Stateless bounded increment and recovery; no global state/clock | It is reusable math, NOT a cross-region conductor or universal gameplay system |
| Vascular receiver | `src/routes/VascularSiltSignalReceiver.js` | Authenticates stored Silt cause; increments membrane load up to 0.85; exponential recovery when Vascular is mounted; flow multiplier `1 - load * 0.085` | `receivedTotal`, `lastReceiptId` and `loadAfter` describe local reception, but do not constitute a separate authenticated Vascular event; saturated receipts may have no actual load increment |
| Vascular route | `src/routes/VascularRhythmRouteSystem.js` | Calls receiver from mounted `update()`, modifies Vascular-owned current and VIS1-B anatomical parameters, publishes `frameState.vascularRhythmRoute.siltSignalResponse` | No Vascular-to-Grave output event; VIS1-B is presentation-only |
| Grave I | `src/routes/GraveMemoryRouteSystem.js` | First-visit read-before-absorb, trace integrity, residue recoil, recovery, retained imprint; published as `frameState.graveMemoryRoute` | Neither Vascular host receipt nor membrane state is consumed |
| Grave II | `src/routes/GraveReturnRegionSystem.js` + `src/routes/GraveResonanceGameplaySystem.js` | Second-entry geometry and coupled three-landmark resonance field | **Separate second-visit layer**, not the first safe receiver for a basic three-region circuit |
| Shared progression | `src/routes/ReturnRegionEngineSystem.js` | Derives return layouts and 3→6→12 phase credits from existing history/Core state | Existing route-history coupling is NOT evidence of a new Silt→Vascular→Grave physiological receipt chain |
| Orchestration | `src/core/GameRuntime.js` | Constructs Silt, Vascular, Grave owners, instantiates common Host ledger, registers mounted region systems | Cannot become a new omniscient circuit simulation owner |

## Proven and missing edges

**PROVEN (source + previous REC field observations):**  
Core deliberate release → Silt's authoritative release decision → Host Silt receipt → Vascular accepts on its *mounted* update → local membrane load/current response → recovery.

**MISSING (source inspection):**  
Vascular publishes a distinct authenticated *effect it actually applied* → Host carries that Vascular result without simulating other cells → Grave I receives on mount → Grave-owned local state influences a later player/region action.

**Do not collapse these distinctions:** a Silt event is not a Vascular event; receiving the same Silt receipt twice is not another Host event; Silt's garden pressing is not the source of the release receipt; Grave I and Grave II are not interchangeable; postprocess presentation samples are not gameplay events.

## Chosen first 3-component circuit

**Silt (cause) → Vascular (bounded response) → Grave I (retained consequence).** The reverse leg to Silt/Core is postponed until this sequence is traced without duplicates or false authority.

- Start the new contract at Vascular's **accepted, applied membrane-load change**, not at a HUD event, visual pulse, mount count, completion, or frame polling.
- The Vascular receipt must have an immutable parent Silt receipt ID; include Vascular owner ID, a monotonic local response sequence, and measured before/after load. Report `appliedDelta = after - before`, never manufacture a nonzero effect at saturation.
- Store downstream events in a **separate Host-owned channel**; do not append them to existing `snapshot().records`, whose schema and sequence are Silt-only and are already validated by C0C tests.
- Grave I reads the new channel only while its local cell is mounted. Grave maintains its own dedupe and capped state, with an explicit response output; Host does not alter Grave state.
- No material transfer, route credit, objective auto-completion, save persistence, off-route ticking, new buttons, target selection or invented propagation distance.

## Proposed minimal passes

| Pass | Mode / owner | Smallest permitted action | Proof gate |
|---|---|---|---|
| C0D1-A | Vascular effect-event capture | Within `VascularSiltSignalReceiver`, expose an immutable local applied-effect event only when a validated receipt *actually changes* membrane load | Correct parent ID, finite `before/after`, no false effect at cap, duplicate suppression, no change to current/decay |
| C0D1-B | Host authenticated relay | Extend `HostConnectionReceiptLedger` with an independent Vascular response channel, validating lineage against accepted Silt provenance | No contamination of Silt snapshots; monotonic, bounded, duplicate/forgery/gap tests; survives mount, not reload |
| C0D1-C | Grave I receiving state | Add a small Grave-owned receiver to `GraveMemoryRouteSystem` (or a focused new helper owned by it). No Grave II edits. | New state appears only in mounted Grave, consumes each authenticated Vascular event once; baseline Grave objectives unaffected |
| C0D2 | Grave local functional consequence | Let the acquired, bounded memory-pressure state measurably modify one *existing* Grave reaction on eligible player input; choose one explicitly and preserve safe-completion bounds | Identical action yields different bounded local results with/without upstream cause, without skipping puzzles |
| C0D3 | History / feedback | Retain a bounded consequence record and expose one eligible later Silt/Core influence using its proper local owner | Parent chain traceable through three components; no off-route simulation, no replay credit |
| C0D4 | Three-component field lock | Use REC observations and a focused test comparing clean vs caused runs, including repeat mounts | Real sequence, no loop explosions, separate owner states, no progression/controls regressions |

The order deliberately avoids a single speculative multi-owner patch. Tests for a pass must pass before authorizing the next.

## Critical acceptance cases for C0D1-A/B/C

1. No Silt release: no Vascular or Grave cause.
2. Valid Silt release, never enter Vascular: Host retains Silt provenance; **no Vascular effect event**.
3. Valid Silt release, enter Vascular: verify source receipt ID and positive measured `appliedDelta` once, if below cap.
4. Saturated Vascular: receive may count another valid Silt source but must not falsely report an additional positive load change.
5. Leave/re-enter Vascular: no duplicate applied-effect event from already-consumed source sequence.
6. Enter Grave I: receive authenticated Vascular event once and create Grave-owned retained local state; repeated mounts do not stack it.
7. Enter Grave without any Vascular response: first-visit Grave behavior remains exactly as it was.
8. Tampered IDs, reversed sequences, NaN values, fake owners: reject without altering state.
9. Recorder: expose parent/source ID, Vascular event ID and Grave accepted ID without implying matter travel.
10. All locked Silt movement, grip, contact, seating, Vascular current and recovery, Grave objective/return, second-visit octave, targeting, controls and 3→6→12 remain functional.

## Locks / delete policy

**Locked:** VIS1-B presentation; Silt source decisions; Host Silt channel/schema; Vascular flow and recipe; Grave first-visit memory completion and Grave II; return phase credits; controller mapping; camera; movement; player Core; chemistry; objectives; saves.  
**Allowed for C0D1-A only:** Vascular receiver local event-emission contract + narrowly targeted test fixture.  
**Forbidden:** Vascular calls Grave directly; a generic frame-wide component manager; updating unmounted cells; new cosmetic wave passes; hidden progression grants.  
**Delete/disable:** none.  
**Regression policy:** owner-scoped patches, independent preflight, exact rollback; never replace 1,500 unrelated source files.

## Checks executed during C0D0

- PASS: `validateC0C2Accumulator.mjs` — 24,234 assertions.
- PASS: `validateC0C3Silt.mjs` — 36,450 assertions.
- PASS: `validateC0C4Vascular.mjs` — 117,393 assertions.
- PASS: `validateC0CRecorderFullSession.mjs` — 5/5.
- PASS: Node syntax checks for `GraveMemoryRouteSystem.js`, `GraveResonanceGameplaySystem.js`, `VascularRhythmRouteSystem.js`, `HostConnectionReceiptLedger.js`.
- LIMIT: legacy Grave validators were not authoritative green gates on this current archive: one cannot load the missing `three/index.js` install; older HC031A/B strict owner-hash locks compare against older `ChemObjectSystem.js` bytes; an LS1E1 older test expects a 2,500-entry recorder cap while the current full-session recorder uses a different limit. These reflect test-environment/version drift and must be assessed separately; **not proof of new Grave gameplay regressions**.
- LIMIT: no browser gameplay or C0D1 implementation was performed for C0D0. Current VIS1-B source matches its published manifest hash; the user's Windows screenshot previously showed its production build passed.

## Exit decision

**C0D0 COMPLETE as an audit/plan.** Continue with **C0D1-A: Vascular-owned applied-effect receipt**, as the smallest real implementation toward the third functional component. Do not reopen VIS1 cosmetics unless function tests later uncover a direct readability blocker.
