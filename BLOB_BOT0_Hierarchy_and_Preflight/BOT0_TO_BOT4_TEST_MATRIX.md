# BLOB — Bot Test Hierarchy / Evidence Gates
**BOT0 is implemented in this package as a source-level policy preflight. BOT1–BOT4 are executable test *specifications*, not completed browser tests.** Do not label these players as human or visually perceptual.

## BOT0: current state model preflight (done here)
Seven deterministic behavior policies are run against all four C0E3 regional types:

| Profile | Stimulus | Target proof |
|---|---|---|
| Idle observer | No verbs, no deliberate site actions | Zero invented actions, waves, or progression claims |
| Novice | Sparse site hops and alternating verbs | Real bounded responses; no invalid state |
| Deliberate experimenter | Deliberate repeated attention to a site | Neighbor transmission arrives; relief bounded |
| Rapid spammer | 10 Pulse actions/second at a single site | In-flight packet not perpetually reset; no runaway |
| Braced oscillator | Stabilize + Pulse alternation at one site | Source/neighbor state remains bounded |
| Chaotic seeded | Deterministic random verbs/sites | No NaN, unbounded state, excess packet count or forged receipt |
| Backtracker | Stop mid-session, return and resume on another site | State not forcibly cleared in the simulation; source-level only, does NOT prove route mount behavior |

Tests use **real C0E2-B and C0E3 exported pure functions**, plus CoreEngineSystem and VerbCompositionSystem. Simulated agents invoke those functions directly. They do not exercise actual controller routing, targeting range, locomotion, Three.js drawing, real audio or mounted regional scene. BOT0 is therefore a safe preflight, not a statement about player experience.

## BOT1: actual-controls first minute (next implementation milestone)
**Instrumentation requirement:** observe built input/target/owner systems. Bot commands travel through the same public input adapter that normal controller/keyboard uses, never write into an owner state to force completion. No `playerRoot.position.set(...)` shortcuts in acceptance runs.

| Scenario | Intended objective | Evidence required |
|---|---|---|
| Uninformed wanderer (fixed seed) | Surface → Guide → Hub, discover where to go | Normal input samples, real cell-change receipts, stuck intervals, HUD prompt timeline |
| Deliberate reader | Find one target, Pulse, Stabilize, Absorb, observe | Intent + focus + owner accepted/rejected + consequent state, with timestamps |
| Wrong-target test | Press same verbs out of range, unsupported or with wrong material | No fabricated effect, no stale HUD 'success', precise refusal reason |
| Revisit | Leave an area, re-enter it | Retained local state and no off-route hidden physics |
| Navigation stress | Explore all Hub roots, move against flow, inspect side pockets | Reachability, active volume transitions, pressure corrections, screenshot references |

**Stop conditions:** crash, duplicated ability dispatch, progression written without owner receipt, 10 seconds continuous stalled movement at high input with unexplained boundary, false green HUD success.

## BOT2: complete regional contracts
Run each in fixed seeds and at least three behavior profiles: exploratory / goal-directed / adversarial spam.
- **Silt:** acquire an identified grain; Pulse move outward, Absorb draw back, Stabilize brace, seat at garden contact, release and reacquire; assert exactly eight immutable material IDs, unique owner, no material from local tissue packet.
- **Vascular:** enter after real Silt releases; establish current relationship with Stabilize and Pulse; verify receipt lineage and bounded membrane load; trace local tissue signals without conflating them with grain arrival.
- **Grave:** attempt before upstream causes and after; verify missing-memory refusal versus authentic history, Grave I risk, and Grave II three-landmark resolution.
- **Hub:** discover three branches, compare visual landmarks versus navigation data, pressure corrections, body/route connection, local roots and targeted responses.

## BOT3: full authored circuit, two visit orders
- **Correct causal order:** Silt release → Host cause → Vascular consumption and effect → Grave memory → Grave II authentic resolution → Host completion receipt → Silt feedback. No teleport objective credit. Verify unique sequence/parent IDs.
- **Exploratory out-of-order:** Grave first, Hub, Silt, Vascular, return Grave, then Silt. Verify no invented history and that the real revisit can complete.
- **Phase comparison:** run equal Silt/Host test fixtures at selected 3/6/12 debug phases; assert *no* invented physiological advantage or progression credit until G4 formally introduces equilibrium physics. Debug state visibly tagged FORCED.

## BOT4: visual/feel acceptance (needs screenshots/video)
A script cannot truthfully grade whether a player understands the rendered environment from numerical fields alone. Require actual frames/screenshots at: initial visual contact, selected focus, effect onset, transmission in flight, arrival, saturation, recovery, revisit, a 3/6/12 comparison and ambiguous targeting. Human / image-capable reviewer determines whether the signal’s direction and consequence are obvious **without the debug overlay**. Audio uses the locked HC027D1 reference.

## Scoring by evidence, not enthusiasm
For each test record: **Pass / Fail / Unexercised / Ambiguous**. Include `run_id`, `build_sha`, random `seed`, route path, controller policy, timestamps, `owner` and exact accepted receipt IDs. A test that wasn't run cannot be counted passed. Targeted sampling and direct state injection are marked **fixture** not normal traversal.

**Minimum Gate G1:** ≥3 fixed seeds × 3 input profiles, 0 invented receipts, 0 false accepted-HUD claims, 0 non-deterministic replay divergences for same seed, one clean 90-second first slice and one full unassisted route attempt. Mechanical navigation and visual comprehension must be reported separately.
