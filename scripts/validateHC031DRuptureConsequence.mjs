import assert from "node:assert/strict";
import fs from "node:fs";
import { residueInfluenceForAge, summarizeRuptureConsequence } from "../src/combat/RuptureConsequenceGrammar.js";
import { GraveResonanceGameplaySystem } from "../src/routes/GraveResonanceGameplaySystem.js";

assert.equal(residueInfluenceForAge(0), 1);
assert.ok(residueInfluenceForAge(20) < 1);
assert.ok(residueInfluenceForAge(80) > 0, "missed debris should settle into a persistent trace rather than vanish");

const silt = summarizeRuptureConsequence({ residues: [{ style: "silt", ageSeconds: 2 }], fragments: [{ style: "silt", cooled: true }] });
assert.ok(silt.nodeBias.retainedDraw > silt.nodeBias.coherentPush, "silt aftermath should bias retained memory more than scar pressure");

const brittle = summarizeRuptureConsequence({ residues: [{ style: "brittle", ageSeconds: 2 }], fragments: [{ style: "brittle", cooled: true }] });
assert.ok(brittle.nodeBias.coherentPush > brittle.nodeBias.retainedDraw, "brittle aftermath should bias scar/coherent-push side");

const echo = summarizeRuptureConsequence({ residues: [{ style: "echo", ageSeconds: 2 }], fragments: [{ style: "echo", cooled: true }] });
assert.ok(echo.nodeBias.heldEquilibrium > echo.nodeBias.retainedDraw, "echo aftermath should bias inheritance/equilibrium side");

const clean = summarizeRuptureConsequence({ residues: [], fragments: [{ style: "echo", collected: true }, { style: "silt", collected: true }] });
assert.equal(clean.residueLoad01, 0);
assert.equal(clean.harvestRatio01, 1);
assert.deepEqual(clean.nodeBias, { retainedDraw: 0, coherentPush: 0, heldEquilibrium: 0 });


function makeResonanceFrame(withAftermath) {
  return {
    activeCellId: "CELL_GRAVE_MEMORY_RESIDUE_BED_001",
    frame: 0,
    runtimeSeconds: 0,
    graveReturnRegion: { active: true, octave: { resonance01: 0.5 } },
    graveRuptureConsequence: withAftermath ? {
      activeConsequence01: 0.75,
      nodeBias: { retainedDraw: 0.115, coherentPush: -0.01, heldEquilibrium: 0.03 }
    } : { activeConsequence01: 0, nodeBias: {} },
    targeting: { relationshipActive: false },
    input: {}
  };
}

function runRegionalDrift(withAftermath) {
  const frameState = makeResonanceFrame(withAftermath);
  const system = new GraveResonanceGameplaySystem({
    frameState,
    chemObjectSystem: { objects: [] },
    graveReturnRegionSystem: { knots: new Map(), strata: [] }
  });
  system.init();
  for (let i = 0; i < 600; i += 1) {
    frameState.frame = i;
    frameState.runtimeSeconds = i / 60;
    system.update(1 / 60, frameState);
  }
  return frameState.graveResonanceGameplay.nodes;
}

const baselineNodes = runRegionalDrift(false);
const aftermathNodes = runRegionalDrift(true);
assert.ok(
  aftermathNodes.retainedDraw.level01 > baselineNodes.retainedDraw.level01 + 0.005,
  `missed silt must measurably bias retained memory without taking over the region (${baselineNodes.retainedDraw.level01} -> ${aftermathNodes.retainedDraw.level01})`
);
assert.ok(aftermathNodes.retainedDraw.level01 <= 1, "aftermath bias must remain bounded");

const runtimeSource = fs.readFileSync(new URL("../src/core/GameRuntime.js", import.meta.url), "utf8");
const resonanceSource = fs.readFileSync(new URL("../src/routes/GraveResonanceGameplaySystem.js", import.meta.url), "utf8");
const consequenceSource = fs.readFileSync(new URL("../src/combat/GraveRuptureConsequenceSystem.js", import.meta.url), "utf8");
assert.match(runtimeSource, /graveRuptureConsequenceSystem/);
assert.ok(runtimeSource.indexOf('register("graveRuptureHarvestSystem"') < runtimeSource.indexOf('register("graveRuptureConsequenceSystem"'), "consequence owner must run after rupture/harvest");
assert.match(resonanceSource, /frameState\.graveRuptureConsequence/);
assert.match(consequenceSource, /cleanupRequired: false/);
assert.match(consequenceSource, /progressionAuthority: false/);
assert.match(consequenceSource, /exitAuthority: false/);

console.log("HC031D rupture consequence PASS");
