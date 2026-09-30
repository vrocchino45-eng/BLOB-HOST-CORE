import * as THREE from "three";
import { GatheringGroundAliveSystem } from "../src/fields/GatheringGroundAliveSystem.js";

const assert = (condition, message) => { if (!condition) throw new Error(`[HC031U2 bots] ${message}`); };
const WATCHER = "gathering_ground_watcher_001";
const RELAY_A = "gathering_ground_relay_a_001";

const makeRoot = (x, y, z) => {
  const root = new THREE.Group();
  root.position.set(x, y, z);
  root.visible = true;
  return root;
};

const createHarness = () => {
  const frameState = {
    activeCellId: "CELL_APERTURE_FIELDS_ARRIVAL_001",
    adjacentHostTerritory: { enteredTerritory: true },
    entityRelationshipGrammar: { byEntityId: {} },
    coreVerbEngineCoupling: { chord: "idle" }
  };
  const playerRoot = new THREE.Group();
  playerRoot.position.set(7.2, 9.3, -54.0);
  const entities = [
    { instanceId: WATCHER, root: makeRoot(7.4, 9.4, -54.2) },
    { instanceId: RELAY_A, root: makeRoot(3.5, 8.0, -55.0) },
    { instanceId: "gathering_ground_relay_b_001", root: makeRoot(1.5, 9.6, -56.8) }
  ];
  const system = new GatheringGroundAliveSystem({
    scene: new THREE.Scene(),
    playerRoot,
    frameState,
    entitySystem: { entities },
    apertureFieldsArrivalSystem: { entryAnchor: new THREE.Vector3(0, 0, 0) }
  });
  system.onRuntimeMount(frameState);
  return { system, frameState, playerRoot };
};

const clearChords = (frameState) => {
  frameState.coreVerbEngineCoupling.chord = "idle";
  frameState.entityRelationshipGrammar.byEntityId = {};
};
const watcherChord = (frameState) => {
  frameState.coreVerbEngineCoupling.chord = "cohere_project";
  frameState.entityRelationshipGrammar.byEntityId = {
    [WATCHER]: { interpretation: "stable_interrogation", engagement01: 0.5, distance: 2 }
  };
};
const relayChord = (frameState) => {
  frameState.coreVerbEngineCoupling.chord = "cohere_draw";
  frameState.entityRelationshipGrammar.byEntityId = {
    [RELAY_A]: { interpretation: "held_intake", engagement01: 0.5, distance: 2 }
  };
};
const pressureChord = (frameState) => {
  frameState.coreVerbEngineCoupling.chord = "project";
  frameState.entityRelationshipGrammar.byEntityId = {};
};

const runProfile = (name, policy, duration = 120, dt = 0.05) => {
  const h = createHarness();
  const allEvents = [];
  let lastEventSequence = 0;
  const checkpoints = { 30: null, 60: null, 120: null };

  for (let t = 0; t < duration - 1e-9; t += dt) {
    policy({ ...h, t, dt });
    h.system.update(dt, h.frameState);

    const recent = h.frameState.gatheringGroundAlive?.recentEvents ?? [];
    for (const event of recent) {
      if ((event.sequence ?? 0) > lastEventSequence) allEvents.push({ ...event });
    }
    if (recent.length) lastEventSequence = Math.max(lastEventSequence, ...recent.map((e) => e.sequence ?? 0));

    for (const key of [30, 60, 120]) {
      if (checkpoints[key] == null && t + dt >= key) checkpoints[key] = h.frameState.gatheringGroundAlive.completedCount;
    }
  }

  const alive = h.frameState.gatheringGroundAlive;
  const encounters = alive.encounters;
  const interrupted = Object.values(encounters).reduce((sum, e) => sum + (e.interruptionCount ?? 0), 0);
  const ignored = Object.values(encounters).reduce((sum, e) => sum + (e.ignoredCount ?? 0), 0);
  let sameFrameReactive = 0;
  for (const id of ["reactive_watcher_stable_interrogation", "reactive_relay_held_intake"]) {
    const starts = allEvents.filter((e) => e.kind === "started" && e.encounterId === id);
    const completions = allEvents.filter((e) => e.kind === "completed" && e.encounterId === id);
    for (const completion of completions) {
      const prior = [...starts].reverse().find((start) => start.territoryAge <= completion.territoryAge);
      if (prior && completion.territoryAge - prior.territoryAge < 0.2) sameFrameReactive += 1;
    }
  }

  return {
    name,
    checkpoints,
    final: alive.completedCount,
    cycles: alive.ongoingResponseCycles,
    memory: alive.memory.mode,
    ignored,
    interrupted,
    sameFrameReactive,
    events: allEvents,
    encounters
  };
};

const policies = {
  normal_explorer({ frameState }) {
    const alive = frameState.gatheringGroundAlive;
    if (!alive) return clearChords(frameState);
    const w = alive.encounters.reactive_watcher_stable_interrogation;
    const r = alive.encounters.reactive_relay_held_intake;

    if (w?.state === "active" || (w?.state === "available" && w.retryBackoff <= 0 && (w.completionCount === 0 || alive.ongoingResponseCycles < 2))) {
      watcherChord(frameState);
      return;
    }
    if (r?.state === "active" || (r?.state === "available" && r.retryBackoff <= 0 && r.completionCount === 0)) {
      relayChord(frameState);
      return;
    }
    clearChords(frameState);
  },

  slow_observer({ frameState }) {
    clearChords(frameState);
  },

  aggressive_verb_user({ frameState, t }) {
    const alive = frameState.gatheringGroundAlive;
    if (!alive || t < 7) return pressureChord(frameState);
    const phase = Math.floor(t * 5) % 5;
    if (phase === 0) watcherChord(frameState);
    else if (phase === 2) relayChord(frameState);
    else pressureChord(frameState);
  },

  boundary_traversal_stress({ frameState, playerRoot, t }) {
    const far = Math.floor(t / 2.4) % 2 === 1;
    playerRoot.position.set(far ? 28 : 7.2, far ? 13 : 9.3, far ? -44 : -54);
    const alive = frameState.gatheringGroundAlive;
    if (!alive || t < 7) return clearChords(frameState);
    if (Math.floor(t * 2) % 2 === 0) watcherChord(frameState);
    else relayChord(frameState);
  },

  backtracker({ frameState, playerRoot, t }) {
    const away = t >= 18 && t < 42;
    playerRoot.position.set(away ? 26 : 7.2, away ? 11 : 9.3, away ? -44 : -54);
    const alive = frameState.gatheringGroundAlive;
    if (!alive) return clearChords(frameState);
    const w = alive.encounters.reactive_watcher_stable_interrogation;
    const r = alive.encounters.reactive_relay_held_intake;
    if (!away && w?.completionCount === 0 && (w?.state === "available" || w?.state === "active")) return watcherChord(frameState);
    if (!away && t >= 42 && r?.completionCount === 0 && (r?.state === "available" || r?.state === "active")) return relayChord(frameState);
    clearChords(frameState);
  },

  chaotic_fixed_seed: (() => {
    let seed = 0x31c0ffee;
    const random = () => {
      seed = (1664525 * seed + 1013904223) >>> 0;
      return seed / 0x100000000;
    };
    return ({ frameState, playerRoot, t }) => {
      if (Math.floor(t * 4) !== Math.floor((t - 0.05) * 4)) {
        const r = random();
        if (r < 0.18) playerRoot.position.set(27, 12, -45);
        else playerRoot.position.set(7.2, 9.3, -54.0);
      }
      const slot = Math.floor(t * 3) % 7;
      if (slot === 0) watcherChord(frameState);
      else if (slot === 3) relayChord(frameState);
      else if (slot === 5) clearChords(frameState);
      else pressureChord(frameState);
    };
  })()
};

const results = Object.entries(policies).map(([name, policy]) => runProfile(name, policy));

// Convergence invariants. Exact counts may vary slightly with test dt, but the behavioral split must remain.
const byName = Object.fromEntries(results.map((r) => [r.name, r]));
assert(byName.normal_explorer.final === 6, "normal explorer should achieve initial 6/6");
assert(byName.normal_explorer.cycles >= 2, "normal explorer should see recurrent ecology after 6/6");
assert(byName.slow_observer.final === 2, `slow observer should remain ambient-only, got ${byName.slow_observer.final}/6`);
assert(byName.slow_observer.memory === "quiet_observer", "slow observer memory should remain quiet_observer");
assert(byName.aggressive_verb_user.interrupted > 0, "aggressive verb user should interrupt reactive responses");
assert(byName.boundary_traversal_stress.interrupted > 0, "boundary stress should interrupt at least one response");
assert(byName.backtracker.final === 6, "backtracker should preserve state and finish after return");
assert(byName.chaotic_fixed_seed.interrupted > 0, "chaotic profile should produce interruptions");
for (const result of results) {
  assert(result.sameFrameReactive === 0, `${result.name} produced same-frame reactive completion`);
}

console.log("HC031U2 six-profile bot convergence PASS");
console.log("profile | 30s | 60s | 120s | cycles | memory | ignored | interrupted | same-frame");
for (const r of results) {
  console.log([
    r.name,
    `${r.checkpoints[30] ?? r.final}/6`,
    `${r.checkpoints[60] ?? r.final}/6`,
    `${r.checkpoints[120] ?? r.final}/6`,
    r.cycles,
    r.memory,
    r.ignored,
    r.interrupted,
    r.sameFrameReactive
  ].join(" | "));
}
