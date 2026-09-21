# HC028A Telemetry Schema — `blob.session.telemetry.v1`

## Session envelope

The exported JSON contains:

- `session` — build, baseline, timestamps, duration, authority declaration.
- `summary` — session-level counts and final Core phenotype.
- `events` — sparse meaningful events.
- `movementSamples` — 2 Hz path/context/input samples.
- `coreSnapshots` — 10-second and topology-change phenotype snapshots.
- `developerTruth` — alias dictionaries/internal truth that must be removed from future blind-agent input.

## Event shape

Each event contains:

- `seq` — monotonic session event sequence.
- `t` — seconds since telemetry session start.
- `frame` — runtime frame number.
- `type` — stable event identifier.
- `channel` — `input`, `perceptual`, or `internal`.
- `cell` — anonymous cell identifier.
- `percept` — future blind-agent-facing observable record.
- `developer` — internal diagnostic truth.

Current event families include:

- `session.started`
- `world.cell.changed`
- `attention.target.changed`
- `verb.pulse.released`
- `verb.absorb.started` / `verb.absorb.ended`
- `verb.stabilize.started` / `verb.stabilize.ended`
- `verb.boost.started` / `verb.boost.ended`
- `action.interact`
- `action.core_work.enter_requested`
- `sonar.return`
- `sonar.resolution.increased`
- `host.consequence.started`
- `host.relationship.emerged` / `host.relationship.faded`
- `rhythm.semantic_stagnation.entered` / `rhythm.semantic_stagnation.cleared`
- `core.topology.changed`
- `debug.test_platform.jump`
- `playtest.marker`
- `telemetry.exported`

## Percept / developer boundary

Example sonar record conceptually:

```json
{
  "type": "sonar.return",
  "percept": {
    "source": "anon_003",
    "returnCharacter": "broad_diffuse",
    "distance": 7.4,
    "pulseMode": "charged",
    "observationCount": 2,
    "resolutionStage": 2,
    "presentationStage": "layering"
  },
  "developer": {
    "sourceId": "AUTHORED_INTERNAL_ID",
    "reachClass": "deep_structural",
    "structuralInterpretation": "layering_and_intervening_volume",
    "responseClass": "dense_structure"
  }
}
```

The future AI agent should receive only the `percept` side plus approved memory/history. The developer side exists to let us compare the agent's interpretation against authored truth afterward.

## Movement samples

Movement samples are approximately 2 Hz and include anonymous cell, position/velocity/speed, anonymous current target, current rhythm beat, semantic-change age/risk, reserve, and compressed action state (move/look axes and held verbs).

## Core snapshots

Core snapshots record phenotype rather than only a final class label: personality, Deep/Inner/Membrane weights, topology/distribution, endurance state, 3→6→12 engine phase/RPM/load, retained-piece/composition context, growth stage, and visual recipe.

This is intended to let later analysis compare **how a player behaved** with **what their Core became** over time.
