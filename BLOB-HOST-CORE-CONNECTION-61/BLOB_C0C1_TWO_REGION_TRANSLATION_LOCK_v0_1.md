# BLOB: HOST CORE — C0C1 Two-Region Translation / Ownership Lock v0.1

**Mode:** design, source contract inspection, offline checks only. **Status:** C0C1 candidate for approval; no gameplay files changed. **Baseline:** assembled LS1E2 checkpoint and C0A/C0B, not a verified snapshot of a newer live branch.

## Decision

**Two actual existing structures** will be used to prove the `HostCircuitBehavior/C01` bounded-accumulator family:

1. **Silt:** `silt-garden-catchment-contact`, built by `SiltPressureRouteSystem.createSiltContactPatch`, behavior in `SiltCompressionContact`. This is a proximity-based *held-grain against sediment* contact, not a collider, material transfer, or an unbounded reservoir.
2. **Vascular:** LS1E2 receiving membrane owned by `VascularRhythmRouteSystem` through `VascularSiltSignalReceiver`. It processes Host-authenticated deliberate Silt *release provenance*, not grains crossing regions.

These are **two independent accumulator instances**, not a claim that Silt's local contact pressure itself produces the Host release receipt. The Host source is *deliberately releasing an unseated Silt grain*; local garden-plate pressing is a distinct owner-local mechanism. Shared accumulator **behavior** does not imply shared state, common physical units or automatic causality between them.

## Source trace and status

| Role | Exact inspected source | Verified basis | Scope of evidence |
|---|---|---|---|
| Silt scene identity | `src/routes/SiltPressureRouteSystem.js`: `createSiltContactPatch`, `updateSiltContact` | SOURCE; earlier D2 and LS1E1T FIELD of contact | One existing garden catchment patch, id `silt-garden-catchment-contact`; patch animation driven by contact's `pressure`, seating overrides visible pressure |
| Silt pressure authority | `src/contact/SiltCompressionContact.js` from LS1D1D2M contact-arbitration overlay | SOURCE; earlier recorded `contact-pressed`, braces, imprints | Existing `pressurePerPulse=0.42`, cap `1`, requires held grain touching patch and directed Pulse, no absorb at acceptance; relaxes linearly or resets when held grain changes |
| Silt release source | `SiltPressureRouteSystem.recordSiltDecision` → `HostConnectionReceiptLedger.observeSiltRelease` | FIELD from LS1E1T / LS1E2 ledger | Release receipt is *about* a material event; does not move material to Vascular |
| Vascular receiver | `src/routes/VascularSiltSignalReceiver.js`, called in `VascularRhythmRouteSystem.update` | SOURCE + LS1E2 FIELD | Increment derived from verified receipt speed, cap .85; exponential decay while Vascular mounted; flow scale applied through existing current authority |
| Vascular response | `VascularRhythmRouteSystem.applyDynamicCurrent`, `animate` | SOURCE + published local-flow telemetry | Runtime-computed current multiplier confirmed; subjective visual prominence not proven by telemetry |

**Source inventory caveat:** assembled LS1E2 working folder lacked the separate `SiltCompressionContact.js` file. This contract cross-check used the actual D2M source overlay for that class, and the assembled LS1E2 `SiltPressureRouteSystem.js` calling it. **Do not make a release build until a full install tree is reconciled** (or the real repository supplies these files); compilation of the partial worktree is not established.

## Typed, owner-scoped C01 instances

| Contract field | C01-Silt | C01-Vascular |
|---|---|---|
| instanceId | `C01.SILT.GARDEN_CONTACT` (design ID only) | `C01.VASCULAR.SILT_RECEIVER` (design ID only) |
| state owner | `SiltCompressionContact` under `SiltPressureRouteSystem` | `VascularSiltSignalReceiver` under `VascularRhythmRouteSystem` |
| canonical state | `pressure ∈ [0,1]`; `imprinted`, `braced`, `heldId` remain Silt-owned | `membraneLoad ∈ [0,.85]`; `receivedTotal`, `lastSequence` remain Vascular-owned |
| input semantic type | `local.contact_pulse_accepted` (**PROPOSED subtype**, emitted only after existing in-contact, directed, held grain conditions) | `signal.provenance_receipt` (existing C0B type, authenticated Host ledger) |
| input guard | `touching && !absorbHeld && (bracedPulse / approach / resisted Pulse satisfies current mode)` | known Silt cell/system, correct ID schema, source sequence, existing ledger; receiver dedupes ledger sequence |
| accumulation | `pressure' = min(1, pressure + 0.42)` on an accepted contact press | `load' = min(.85, load + .14 + .055*clamp(speed/2.5,0,1))` |
| recovery | Existing held-contact logic: if `pressure>0 && (!braced || absorbHeld)`, subtract `clamp(dt,0,.1)*(absorbHeld?1.4:.8)`; changing held ID resets pressure immediately | Owner-mounted update: `load' = load*exp(-min(dt,.25)*.018)` for finite `dt>0`, zero below `.0001` |
| other state conditions | `imprinted` is triggered at `pressure>=.80` *during press* and relaxes below `.15`; plate occupancy can override visible pressure without mutating this field | flow multiplier `1 - membraneLoad*.085` as existing Vascular local output; no route cadence overwrite |
| lifecycle | Silt mounted update; local held-grain state; release clears contact pressure | Vascular mounted update; retained across cell remounts in same runtime; resets on full reload |
| output | `local.normalized_load` / `presentation.parameter` for garden patch indentation, echo and imprint; no independent regional progression | `local.flow_multiplier` for Vascular current + read-only membrane expression |
| forbidden | remote Host signal from an arbitrary contact press, automatic material transfer, counterfeit imprint credit | receiving material units, progression credit, off-route ticking, resetting Silt contact pressure |

### Why the common kernel needs policy hooks

**Common:** finite local scalar, typed valid input, accumulation, saturation, owner-supplied decay, bounded owner-approved time step, diagnostic previous/next state. **Owner policy:** source authentication, per-event increment, linear-vs-exponential decay, grip-release reset, imprint hysteresis, reception sequencing, presentation and current output. A giant component that owns all those region-specific rules would be a parallel gameplay engine; this is explicitly forbidden.

**Acceptance nuance:** The C0C2 code pass may share the exact saturating accumulation function and a minimal decay-policy dispatcher *only if* numerical compatibility with the existing Silt and Vascular code is shown. Do not alter either region to conform to a preferred universal equation. This is an extraction/convergence pass, not gameplay expansion. If the shared kernel is too abstract to yield a meaningful implementation, retain the two specialized owners and mark the translation proof as *descriptive only*. That is an acceptable negative result.

## Actual separate causal chains (no false bridging)

```text
CORE held grain + Pulse + contact -> SiltCompressionContact PRESSURE
                                  -> existing Silt patch shape / imprint
                         (Silt-local C01 candidate)

CORE deliberately releases unseated grain -> Silt authoritative release
  -> HostConnectionReceiptLedger signal receipt -> mounted Vascular receiver LOAD
  -> Vascular-owned current scale / existing membrane animation
                         (Vascular-local C01 candidate)
```

A common C01 accumulator does NOT imply that Silt pressure is piped into Vascular. If a future design wants that, it needs a **separate authorized Silt pressure event**, a new Host receipt contract, and a new Vascular acceptance test—not an implicit port coercion.

## C0C-T1 build shape, after C0C1 review

**C0C2 — shared pure behavior kernel + parity:** add `src/hostCircuit/BoundedAccumulatorBehavior.js` or similar *stateless* utility only; owner references pass in state, caps, increments and policy. No global component registry; no new clock. Write exact legacy-equation parity tests incl. `dt` clamping, boundaries and reset semantics. **Stop** if parity fails.

**C0C3 — Silt owner adapter:** invoke common bounded math *inside* `SiltCompressionContact` at existing press/relax decision sites. Preserve exact contact arbitration, `pressurePerPulse`, imprint moment, immediate release reset and existing visuals. No new organ required.

**C0C4 — Vascular owner adapter:** invoke same bounded math *inside* `VascularSiltSignalReceiver`; preserve every receipt guard, sequence/dedupe, decay, flow and current integration. Do not change Vascular cadence or output envelope.

**C0C5 — narrow field test:** test both owners with 6–10 minute focused playthrough (max 25-minute upload). Export REC observation JSON. Measure independent Silt pressure and Vascular membrane load after deliberately created Silt release, plus visual readability report. Distinguish fresh capture events from pre-capture baselines.

## C0C1 convergence governance

| Constraint | Decision |
|---|---|
| Mode | design and offline proof; no gameplay overlay in C0C1 |
| Purpose | lock exact Silt/Vascular targets, types, ownership, two regional expressions, and migration stop rules |
| Allowed | source inspection, existing telemetry, contract fixtures and isolated algebra/sanity tests |
| Forbidden | active code rewrites, third region/Grave, new controls, off-route physics, generic persistent graph, new Host transport, new save fields, synthetic energy or material |
| Locked | LS1E2 receiver and event counts, Silt grip/contact and plate seat, source ledger, original Core three verbs, Host rhythm, 3→6→12, progression, targeting camera |
| Delete/disable | None (any later removed duplicate code must be precisely documented and regression-tested) |
| Visual target for C0C-T1 | Actual sediment compresses and imprints; membrane shifts with owned load; differentiated forms without electrical symbols |
| Feel target for C0C-T1 | No change to control mapping or targeting; accumulation and relaxation feel distinct and legible |
| Acceptance | one reusable stateless kernel or documented falsification; exact equation parity; two independent owner states; visible effects backed by outputs |
| Regression | Silt candidate→LT+A grip→Stabilize contact→Pulse pressure→Absorb/release→seat; Vascular receipt replay/dedupe, flow math, mount/unmount/reload; Silt material ID 01–08 conservation; no new progression; REC unchanged |

## Gate checklist before implementation

- [x] Exact Silt site chosen from actual source; not a newly invented region feature.
- [x] Exact Vascular receiver chosen from implemented LS1E2; host provenance retained.
- [x] Owners, legal inputs, bounded variables, recovery and outputs differentiated.
- [x] Pressing Silt's catchment is **not** misrepresented as a Vascular source receipt.
- [x] Distinct live equations recorded; no hidden universal-engine claim.
- [x] No gameplay changes authorized by this document.
- [ ] Reconcile complete target install source tree (assembled LS1E2 audit folder is missing one separately versioned contact helper).
- [ ] C0C2 numerical parity/regression check against the actual installed baseline.
- [ ] C0C5 field validation, visual readability and interaction feedback.

**Verdict:** C0C1 is ready for review. Freeze architecture choices above before authoring C0C2. The next deliverable should be a **small changed-files-only test overlay after numerical parity**, not an expanded build or a rewritten runtime.
