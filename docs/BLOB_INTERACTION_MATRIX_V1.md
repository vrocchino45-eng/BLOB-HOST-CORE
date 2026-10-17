# BLOB — Fundamental Interaction Matrix v1 (LS1D1D2N1)

**Status:** Canonical design **proposal** with one implemented Silt proof; not a claim of finished global features.

## Fundamental grammar

**The Core acts. The World responds. The Host governs. The Guide interprets.**

A `verb` is a physical *intent*, not a context-specific guaranteed effect.

- **Stabilize**: discover, select, hold, and maintain a relationship.
- **Pulse**: send outward influence. A free unit can displace; a stabilized unit against receptive resistance transmits pressure instead; other recipients may transmit or disperse it.
- **Absorb**: withdraw, draw inward, or extract, subject to the material and receiving relationship. Grip displacement is **not** the same as chemical/Core consumption.
- **A / deliberate interaction**: commits or releases a relationship when the selected context supports it; not a fourth general physical verb.

General interpretation: **object identity + material properties + host/environmental state + ordered verb sequence + relationship history → bounded result + feedback + persisted consequence**.

## Interaction states and transitions

- `free/native` — material follows existing environment rules.
- `candidate` — possible aimed relationship; no ownership changes.
- `core-held` — committed contact, bounded by the original grip.
- `touching` — physical authored receiving-site proximity, no auto-snap.
- `braced` — Stabilize actively maintains contact; Pulse channels into resistance.
- `imprinted` — reversible pressure threshold reached; site can accept placement.
- `seated` — deliberate release transfers **site relationship** from Core grip to authored surface. Material identity, mass, and ledger owner remain unchanged (`environment`).
- `extracted` — deliberate reacquisition cancels the site claim, then normal grip movement resumes.
- `free/altered trajectory` — implemented as a bounded Silt-local kinematic proof in D2O1. On unseated release, maintain current position and direction; the native path exerts a gradual restoring influence instead of an immediate reset.

The system should express relationships separately from conserved matter ownership. A Silt grain seated at a sediment plate is still one Silt grain; the plate has a **spatial claim**, not chemistry/intake ownership.

## Verb-sequence matrix

| Desired effect | Sequence / situation | Result authority | Current status |
|---|---|---|---|
| Reveal a structure | Stabilize → Pulse | Structure's response | Existing Silt pressure read, different mechanism |
| Free push | Grip/Stabilize → Pulse | Existing bounded held-grain movement | **Implemented D2I/D2M** |
| Retract | Grip/Stabilize → Absorb | Existing bounded held-grain movement | **Implemented D2I/D2M** |
| Compression | Grip → actual surface touch → Stabilize + Pulse | One authored Silt surface | **Implemented D2M** |
| Plate seat | Compression to imprint → deliberate A/LT release, not RT | One authored Silt site | **Implemented D2N1 candidate** |
| Plate extraction | Approach seated grain → LT + A (near enough) | Same authored Silt site + grip | **Implemented D2N1 candidate** |
| Launch then wander | Stabilize + grip → Pulse/move → unseated release → autonomous path | Silt-only route-local kinematic trajectory + native attractor | **Implemented D2O1 candidate; needs rendered playtest** |
| Fracture | Stabilize → repeated Pulse above material resistance | Proposed material resistance | **Not implemented** |
| Piece selection | Fracture → select fragments → Absorb | Proposed identity/conservation transactions | **Not implemented** |
| Redirect flow | Stabilize channel → Pulse/Absorb | Future Vascular medium | **Not implemented** |
| Release old bond | Stabilize remnant → directed Absorb/Pulse | Future Grave medium | **Not implemented** |

**Not every verb combination is valid for every object.** Successful transitions require actual contact, range, material/surface compatibility, resistance thresholds, and conscious completion. Avoid script-only keypad puzzles or button-combo mnemonics.

## Authority and conservation locks

1. Stable individual IDs and eight unit masses; no duplication, deletion, replacement mesh or Core chemistry caused by the plate.
2. Environment owner remains `environment`; `grip` only while Core explicitly holds, site seating is tracked separately. No new ledger owner or representation enum.
3. Existing Silt native cycle remains the **phase/native-path authority** for unseated units; D2O1 adds separate current trajectories only to **released, previously gripped** units. Withheld units (Core-held and plate-seated) are independently frozen so one cannot overwrite the other.
4. D2M +0.28 Pulse, 0.72/s Absorb, 0.38–1.60 tether, 0.42 contact pressure, 0.80 imprint threshold unchanged.
5. One authored garden patch only, one occupied seat; no remote auto-placement, collision forces, fracture, nutrient, orbit engine or progression grants.
6. D2N1V seat persists across Silt unmount/remount in the **same runtime**. Persistent save/load and distant region motion are future work, not promised here.
7. A receiving site can decline seating if unready/occupied/out of contact. RT withdrawal deliberately prevents seating; free release before imprint now retains a bounded last trajectory with native-path attraction.

## Proposed future entity/receiving-site contract (design only)

`identity; material; current owner; nativePath; motionMemory; supportedVerbs; receivableSites; contactRequirements; resistance; pressureThreshold; seat/extract rules; persistentHistory; ecologyFeedback; Guide/readability; conservationProof; recoveryPolicy`.

The Guide should make the *relationship* readable without replacing experimentation. Feedback distinguishes approaching (quiet), gripping (focused), touching (contact), braced (turquoise), pressure (amber), seated (gold), extraction (retraction), and rejected attempts (brief dissonant feedback).

## Milestone ladder

- **D2M locked baseline:** Contact-before-Pulse works; 22 successful presses and four imprint formations recorded in field test.
- **D2N1V verified:** One explicit surface-seat/extract transaction, visible wireframe-held grain, return/re-attach, separate ledger/cycle authority; confirmed in player playtest.
- **D2O1 candidate (this patch):** Individual route-local last-trajectory motion, native path as gradual attractor, no immediate reset; no distant/off-route simulation or save persistence. Field test required.
- **Matrix expansion:** Prove additional receiving-material pairs only once the first seated/free/retrieved loop feels intentional.

## Required field acceptance

1. Grip a free unit; Pulse it away from the site and verify D2M +0.28 still works.
2. Move a grain into actual plate contact, Stabilize, Pulse twice for imprint; then release **A or LT** (without RT).
3. Grain remains where seated as Core moves away beyond tether range. Aim at the same site later; it is the **same grain ID**, not a replacement.
4. Reacquire the seated grain with LT + A while within 1.6 units, then Absorb to retract. Site clears; upon release, the unit follows an independent bounded trajectory whose North Star remains the original Silt cycle.
5. Verify a second grain can still be gripped/cycled while the first remains seated.
6. Revisit Silt in the same session: seated grain still present; total eight identities, eight mass, all final owners environment; existing Silt progression unchanged.
7. Recorder shows `silt-seat:plate-seated` and `silt-seat:plate-extracted` receipts and `siltPlateSeat` state. D2O1 additionally exports `siltTrajectory` with release receipts and per-unit motion state; no assertion of physical collision or save persistence.

## Build scope

**Mode:** Convergence and foundational interaction proof.

**Allowed:** Verified one-site seating and visual retention; D2O1 adds bounded route-local unseated-grain kinematic history, directional wake, read-only receipts.

**Forbidden:** Global verb redirection, general new targeting, chemistry, intake, progression, 22-region rewrite, physical impulses/collision, material owner enum changes, global cross-region free trajectories.

**Delete/disable:** None; do not apply experimental deferred authority guard.

**Regression:** D2M brace/Pulse; D2I movement; stable individual ledger and Silt native cycle; other regions, Hub/Surface, Guide, camera; unmount/revisit.

## D2O1 bounded extension — Free trajectory / North Star (2026-10-17)

**Field-verified prerequisite:** D2N1V plate seating is visually retained as a wireframe-supported grain and can be reattached to the Core. Preserve that behavior.

D2O1 source implementation introduces *route-local* kinematic position and velocity for individual **unseated** grains after deliberate release from an actual Core grip. Native `SiltLivingMaterialCycle` phases continue to describe the ecological rhythm; their authored path positions serve as soft restoring targets, not per-frame overrides of the released grain's actual position. Every grain has the same stable ID; no duplicate material entity, collision system, impulse or chemistry transfer is created.

| Existing relationship | Sequence | D2O1 response | Proof limit |
|---|---|---|---|
| Held, unseated grain | LT+A grip → Pulse/Absorb/move → release A or LT | Retains release position, bounded recent motion direction, moves autonomously and gradually homes toward authored native position | One Silt runtime route, kinematic steering rather than physics |
| Free wandering grain | Reacquire using LT+A | Existing free trajectory stops; same body and identity returns to grip; subsequent release records a new disturbance | Grip camera targeting, phase eligibility and range remain unchanged |
| Braced grain with completed imprint | Legitimately seat at plate | **No free trajectory**. Existing receiving-site anchor and visible wireframe remain authoritative until deliberate extraction | D2N1V seat rule remains unchanged |
| Never-gripped grain | No intervention | Unchanged native authored cycle and positions | No mass/phase/position rewrite |

Motion history stores bounded per-unit release count, travel distance, and maximum native-path deviation. Telemetry is observational, not a material ledger. Returning toward the path is gradual and does **not** promise an exact orbit, physical collisions, or a deterministic galaxy-wide trajectory. No off-route simulation or save-load persistence is added in D2O1.

**Updated next step:** Only lock D2O1 after gameplay shows a disturbed grain visibly follows a changed path *after release*, without snapping, while a seated grain is retained and recoverable. Then determine whether free material should influence its ecological phase or enter adjacent areas; such changes require an independent authority audit.
