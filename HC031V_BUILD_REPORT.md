# HC031V — Living Response Readability / Telemetry Truth

## Parent
HC031U2.1 — Gathering Ground Relationship Intent Latch.

## Purpose
The U2.1 human run proved LIFE 6/6 plus persistent recurrence, but known recurring answers were still hard to distinguish from repeated button noise and the telemetry analyzer classified many meaningful answers as `no_gain`. HC031V changes readability and read-only telemetry only.

## Locked mechanics
The accepted U2.1 reactive encounter methods, interruption/rearm logic, cross-territory cycle logic, and timing constants are hash-locked by `hc031vLivingResponseTelemetryTruthContract.json`. No movement, targeting, traversal, chemistry, cell, route, save-state, progression, or encounter-rule authority changes.

## Player-facing response signatures
The same existing presentation bodies now rotate through three response signatures on repeated answers:
- Watcher: `tight -> reverse -> wide`
- Relay: `forward -> return -> held`
- Ridge Echo: `single -> split -> stagger`
- Matter Spill: `settle -> pulse -> bloom`

No new draw-call intent is added. The Watcher ring, relay thread/packet, seven instanced echo beads, and spill residue are reused.

## HUD truth
Gathering Ground debug HUD retains LIFE / INT / LOOP / MEM and adds `RESP`:
- `RESP NEW W/tight` = first Watcher answer
- `RESP KNOWN W1/reverse` = first repeated Watcher answer
- corresponding R / E / S codes identify Relay, Echo, and Spill answers.

## Telemetry truth
Schema: `blob.session.telemetry.v1.50`.

New event: `semantic.meaningful_response`. It records a known recurring ecology answer without awarding information gain. Attempt outcomes are now:
- `information_gain`
- `meaningful_response`
- `no_gain`

While Gathering Ground is active, Pulse/Absorb/Stabilize attempts use a 3.4-second resolution window so the accepted 2.4-second Watcher and 2.8-second Relay response durations fit inside the causal observation window. New-information events retain priority over meaningful-known-response classification.

Semantic churn now uses `semanticAnswerAge` (the younger of new-information age and meaningful-response age), so a clearly answering ecology does not get mislabeled as churn simply because the answer is already understood.

## Validation
- HC031V structural/readability validator: PASS
- HC031V telemetry-truth smoke: PASS
- inherited HC031U2.1 latch smoke: PASS
- inherited six-profile U2.1 bot convergence: PASS
- JS syntax checks for changed runtime files: PASS

## Full-project proof
The V delta was also aligned onto the reconstructed full runtime and `npm run validate:current` passed end-to-end, including V telemetry truth, inherited U2.1 latch smoke and six-profile bots, U2/U1/U structural checks, T5 30/60/120/144 FPS Ridge smoke, undefined-method audit, RecipeData load, and changed runtime syntax checks.
