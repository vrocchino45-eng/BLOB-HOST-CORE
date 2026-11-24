import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const report = process.env.BLOB_BOT_REPORT
  ? resolve(process.env.BLOB_BOT_REPORT)
  : join(mkdtempSync(join(tmpdir(), 'blob-cc01-i2-')), 'lifecycle.json');
assert.ok(!report.startsWith(root), 'Keep browser evidence and its Vite cache outside the checkout');
mkdirSync(dirname(report), { recursive: true });

// Compose probes with the existing earned-triad browser journey in memory.
// The checkpoint harness stays intact and still runs its own 25 assertions.
const harness = readFileSync(join(root, 'CONNECTION52_EARNED_TRIAD_BROWSER.mjs'), 'utf8').replaceAll('\r\n', '\n');
function replaceOnce(source, anchor, replacement) {
  const index = source.indexOf(anchor);
  assert.ok(index >= 0 && index === source.lastIndexOf(anchor), 'Earned-triad harness anchor changed: ' + anchor);
  return source.slice(0, index) + replacement + source.slice(index + anchor.length);
}

async function installProbes(page, steps, tap, check, assert) {
  const layout = process.env.CC01_TEST_LAYOUT;
  const neutral = layout === 'neutral';
  const swap = layout === 'deep-swap';
  const expectedFactor = neutral ? 1 : 1.10;
  const expectedRemoval = neutral ? 0.023 : 0.0253;
  const same = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-12, actual + ' versus ' + expected);
  async function snapshot() {
    return page.evaluate(() => {
      const runtime = window.__SURFACE_RESPONSE__;
      const frame = runtime.frameState;
      const route = runtime.vascularRhythmRouteSystem;
      const chemistry = frame.spatialCoreChemistry;
      const power = frame.corePerformance;
      return {
        cell: frame.activeCellId, host: frame.activeHostId, frame: frame.frame,
        mount: frame.firstSliceRuntimeMount?.mountSequence,
        phase: frame.returnRegionEngine?.unlockedPhaseCount, credits: frame.returnRegionEngine?.creditCount,
        growth: frame.coreGrowth?.earnedEvolution?.earnedFamilies,
        debugAnatomy: frame.coreGrowth?.debugCoreWorkRetainedAnatomySeeded,
        count: chemistry?.retainedPieceCount, distribution: chemistry?.topology?.distribution,
        placements: chemistry?.placements, traits: power?.traits,
        reserve: runtime.coreRadialPerformanceSystem.reserve01,
        sample: power?.stabilizeSample, work: frame.coreWorkManipulation,
        siltExposure: frame.coreChemistryOutput?.siltMembraneExposure,
        attachment: frame.playerAttachment,
        flowExperiment: runtime.flowExperiment === true,
        shelfImprint: runtime.siltPressureRouteSystem.territoryExpansion?.sites
          ?.find(site => site.id === 'silt_porosity_shelf')?.imprint ?? null,
        shelfAccepted: frame.coreFlow?.result?.acceptedCurrent01 ?? 0,
        mass: runtime.siltPressureRouteSystem.materialIdentity?.totalMass() ?? null,
        receipts: runtime.hostConnectionReceiptLedger.acceptedTotal,
        vascularEffects: runtime.hostConnectionReceiptLedger.vascularEffectSnapshot({ withRecords: false }).retainedCount,
        graveMemory: runtime.graveMemoryRouteSystem.vascularEffectMemory.receivedTotal,
        graveResolution: runtime.hostConnectionReceiptLedger.graveIIResolutionSnapshot().lastReceiptId,
        reads: route.lockedCadenceReads, requiredReads: route.recipe.cadence.requiredReads,
        readSequence: route.relationshipReadSequence, completed: route.completed,
        returned: frame.act1RouteHistory?.vascularReturned === true,
        returnHistory: frame.act1RouteHistory?.routeStates?.vascular_route,
        ready: route.returnFoldReady, stabilizing: route.stabilizing, currentDistance: route.pathDistance,
        turbulence: route.turbulence, integrity: route.circulationIntegrity, scattered: route.desynchronized,
        recoverySeconds: route.recoverySeconds, reweave: frame.vascularRhythmRoute?.coreReweave,
        calm: frame.vascularRhythmRoute?.coreCoherenceResponse,
        membraneLoad: route.siltSignalReceiver.membraneLoad,
        physical: frame.physicalFeel?.spatialFeel, viscosity: frame.physicalFeel?.viscosity,
        pressure: frame.physicalFeel?.pressure, acceleration: frame.physicalFeel?.accelerationScale,
        returnHandoff: frame.vascularRhythmRoute?.returnHandoff,
        hud: document.getElementById('playtest-hud-panel')?.innerText ?? null
      };
    });
  }

  async function currentPose(progress, lateral = 0, frames = 0) {
    await page.evaluate(({ progress, lateral, frames }) => {
      const runtime = window.__SURFACE_RESPONSE__;
      const route = runtime.vascularRhythmRouteSystem;
      const place = () => {
        runtime.playerCore.position.copy(route.pathCurve.getPointAt(progress)).add(route.entryAnchor);
        runtime.playerCore.position.y += lateral;
        runtime.playerMovementController.velocity.set(0, 0, 0);
      };
      place();
      // Keep the staged approach pose repeatable. The registered owner applies
      // any turbulence using its usual distance, movement and simulation rules.
      for (let step = 0; step < frames; step++) {
        place();
        window.__steps(1, null);
      }
    }, { progress, lateral, frames });
  }

  async function proveFirstMount() {
    const before = await snapshot();
    await currentPose(.28, 3, 360);
    const scattered = await snapshot();
    await currentPose(.28);
    await page.keyboard.down('q');
    await steps(1, null);
    const recovering = await snapshot();
    await check('The route owner scatters circulation during off-current drift before any read', () => {
      assert.equal(before.reads, 0);
      assert.equal(before.growth.vascular, false);
      assert.equal(before.debugAnatomy, false);
      assert.ok(scattered.turbulence > before.turbulence && scattered.scattered);
      assert.equal(scattered.integrity, before.integrity);
    });
    await check('The first-scatter Stabilize hold recovers at factor 1 with forming anatomy', () => {
      assert.equal(recovering.stabilizing, true);
      assert.ok(recovering.count < 3);
      assert.equal(recovering.reweave.eligible, false);
      assert.equal(recovering.reweave.factor, 1);
      assert.equal(recovering.reweave.neutralReason, 'forming_topology');
      assert.ok(recovering.reweave.turbulenceRemoved > 0);
    });
    await currentPose(.28, 0, 90);
    await page.keyboard.up('q');
    await steps(1, null);
    return { before, scattered, recovering };
  }

  async function prepareThirdRead() {
    await page.keyboard.up('q');
    await currentPose(.82, 3, 380);
    await page.keyboard.down('q');
    return snapshot();
  }

  async function openWork() {
    await tap('f');
    await tap('g');
    const state = await snapshot();
    assert.equal(state.work.active, true);
    assert.equal(state.sample.active, false);
    return state;
  }

  async function movePiece(family, zone, outward) {
    const selection = async () => page.evaluate(() => {
      const frame = window.__SURFACE_RESPONSE__.frameState;
      return frame.coreWorkManipulation.selectedChemistry?.family;
    });
    for (let index = 0; index < 3 && await selection() !== family; index++) await tap('ArrowRight');
    assert.equal(await selection(), family);
    await tap('e');
    assert.equal((await snapshot()).work.held, true);
    if (outward) await page.mouse.down({ button: 'right' });
    else await page.keyboard.down('q');
    try {
      for (let batch = 0; batch < 30; batch++) {
        const selected = await page.evaluate(() => {
          const work = window.__SURFACE_RESPONSE__.frameState.coreWorkManipulation;
          return { zone: work.selectedChemistry?.zoneId, radius: work.selectedRadius };
        });
        const beyondBoundary = zone === 'inner_body'
          ? selected.radius >= 0.66 && selected.radius <= 0.79
          : zone === 'deep_core' ? selected.radius < 0.37 : selected.radius > 1.05;
        if (selected.zone === zone && beyondBoundary) break;
        await steps(3, null);
      }
    } finally {
      if (outward) await page.mouse.up({ button: 'right' });
      else await page.keyboard.up('q');
    }
    await tap('e');
    const placed = await snapshot();
    assert.equal(placed.work.held, false);
    assert.equal(placed.placements.find(piece => piece.family === family).zoneId, zone);
    assert.equal(placed.sample.active, false);
    return placed;
  }

  async function sampleAcceptance(sample) {
    return page.evaluate(async sample => {
      const { readPriorCoreStabilizeSample } = await import('/src/player/CoreStabilizeSample.js');
      const frame = window.__SURFACE_RESPONSE__.frameState;
      const candidate = { ...frame, corePerformance: { ...frame.corePerformance, stabilizeSample: sample } };
      return readPriorCoreStabilizeSample(candidate, 1 / 60) === sample;
    }, sample);
  }

  async function holdInCurrent() {
    await currentPose(.45, 0, 60);
    const before = await snapshot();
    await page.keyboard.down('q');
    try {
      await currentPose(.45, 0, 3);
      return { before, held: await snapshot() };
    } finally {
      await page.keyboard.up('q');
    }
  }

  async function revisit(firstMount, beforeThird, completed) {
    const grave = 'grave_memory_retention';
    const vascular = 'vascular_rhythm_retention';
    const silt = 'silt_pressure_retention';
    await check('The last authored read leaves real residual turbulence at completion', () => {
      assert.equal(beforeThird.reads, 2);
      assert.equal(beforeThird.readSequence, 2);
      assert.equal(beforeThird.growth.vascular, false);
      assert.ok(beforeThird.turbulence > .34);
      assert.equal(completed.reads, 3);
      assert.equal(completed.readSequence, 3);
      assert.equal(completed.completed, true);
      assert.equal(completed.ready, true);
      assert.equal(completed.growth.vascular, false);
      assert.ok(completed.turbulence > 0 && completed.turbulence <= .2);
    });


    await openWork();
    await movePiece(grave, neutral ? 'membrane' : 'deep_core', neutral);
    if (swap) await movePiece(silt, 'deep_core', false);
    await movePiece(vascular, neutral || swap ? 'membrane' : 'deep_core', neutral || swap);
    await tap('f');
    await steps(3, null);
    const hub = await snapshot();
    await check('Real returns and actual Core Work produce the requested earned layout', () => {
      assert.deepEqual(hub.growth, { grave: true, vascular: true, silt: true });
      assert.equal(hub.debugAnatomy, false);
      assert.equal(hub.count, 3);
      assert.equal(hub.distribution, neutral ? '0:0:3' : '2:0:1');
      assert.equal(hub.returnHistory.transitionOwner, 'LocalCellBoundaryMorphSystem');
      assert.equal(hub.returnHistory.completed, true);
      assert.equal(hub.returnHistory.returnCount, 1);
      assert.equal(hub.turbulence, completed.turbulence);
    });

    // Region-only jump, with anatomy and reads carried from the real returns.
    await page.evaluate(() => { window.__SURFACE_RESPONSE__.inputSystem.queued.debugJumpSlot = 5; });
    for (let count = 0; count < 100; count++) {
      await steps(15, null);
      if ((await snapshot()).cell === firstMount.before.cell) break;
    }
    await steps(3, null);
    const mounted = await snapshot();
    await check('A fresh mounted sample validates on the following step; the Hub sample does not', async () => {
      await steps(1, null);
      assert.equal(mounted.sample.active, true);
      assert.equal(mounted.sample.cellId, firstMount.before.cell);
      assert.equal(mounted.sample.hostId, mounted.host);
      assert.equal(mounted.sample.mountSequence, mounted.mount);
      assert.equal(mounted.sample.sampledFrame, mounted.frame);
      assert.notEqual(mounted.mount, firstMount.before.mount);
      assert.equal(await sampleAcceptance(mounted.sample), true);
      assert.equal(await sampleAcceptance(hub.sample), false);
    });

    await currentPose(.82, 3, 360);
    await tap('x');
    const afterDriftAndPulse = await snapshot();
    await check('Return, remount, off-current drift and Pulse preserve residual before Stabilize', () => {
      for (const state of [mounted, afterDriftAndPulse]) {
        assert.equal(state.completed, true);
        assert.equal(state.ready, true);
        assert.equal(state.returned, true);
        assert.equal(state.reads, completed.reads);
        assert.equal(state.readSequence, completed.readSequence);
        assert.equal(state.turbulence, completed.turbulence);
        assert.equal(state.integrity, completed.integrity);
        assert.equal(state.recoverySeconds, completed.recoverySeconds);
      }
      assert.ok(afterDriftAndPulse.currentDistance > 1.8);
      assert.equal(mounted.physical.turbulence, completed.turbulence);
    });

    await currentPose(.45);
    const suspended = await openWork();
    await page.keyboard.down('q');
    await currentPose(.45, 0, 3);
    await page.keyboard.up('q');
    const suspendedHold = await snapshot();
    await tap('f');
    const resumed = await snapshot();
    await check('Core Work suspends recovery and the world step reacquires a fresh sample', async () => {
      await steps(1, null);
      assert.equal(suspended.sample.active, false);
      assert.equal(suspendedHold.turbulence, completed.turbulence);
      assert.equal(suspendedHold.reweave.neutralReason, 'post_read');
      assert.equal(resumed.sample.mountSequence, mounted.mount);
      assert.equal(resumed.sample.active, true);
      assert.equal(await sampleAcceptance(suspended.sample), false);
      assert.equal(await sampleAcceptance(resumed.sample), true);
    });

    const hold = await holdInCurrent();
    await check('The placement publications retain the selected families through Vascular remount', () => {
      const held = hold.held;
      const placement = family => held.placements.find(piece => piece.family === family);
      for (const piece of hub.placements) {
        assert.equal(placement(piece.family).pieceId, piece.pieceId);
        assert.equal(placement(piece.family).zoneId, piece.zoneId);
      }
      assert.equal(held.siltExposure, swap ? 0 : 1);
      assert.equal(placement(silt).interactionId, swap ? 'silt_ballast' : 'silt_adhesion_skin');
      assert.equal(placement(grave).interactionId, neutral ? 'grave_residue_sense' : 'grave_memory_knot');
      assert.equal(placement(vascular).interactionId, neutral || swap ? 'vascular_signal_skin' : 'vascular_cadence_anchor');
    });
    await check('The earned revisit settles residual while the original return remains complete', () => {
      const { before, held } = hold;
      assert.equal(held.stabilizing, true);
      assert.equal(before.turbulence, completed.turbulence);
      assert.equal(held.reweave.eligible, true);
      assert.equal(held.reweave.mode, 'return_current_residual');
      assert.equal(held.reweave.factor, expectedFactor);
      assert.equal(held.reweave.neutralReason, neutral ? 'coherence_at_or_below_neutral' : null);
      same(held.reweave.turbulenceRemoved, expectedRemoval / 3);
      same(before.turbulence - held.turbulence, expectedRemoval);
      assert.equal(held.reweave.integrityRestored, 0);
      assert.equal(held.integrity, completed.integrity);
      assert.equal(held.reads, held.requiredReads);
      assert.equal(held.readSequence, before.readSequence);
      assert.equal(held.recoverySeconds, before.recoverySeconds);
      assert.equal(held.ready, true);
      assert.deepEqual(held.returnHistory, before.returnHistory);
      assert.equal(held.calm.eligible, true);
      assert.equal(held.calm.factor, Math.min(1.15, Math.max(.85, held.calm.coherence)));
      assert.ok(held.reserve < before.reserve);
      assert.equal(held.credits, hub.credits);
      assert.equal(held.phase, hub.phase);
      assert.equal(held.mass, 8);
      assert.equal(held.receipts, 0);
      assert.equal(held.vascularEffects, 0);
      assert.equal(held.graveMemory, 0);
      assert.equal(held.graveResolution, null);
      assert.equal(held.flowExperiment, false);
      assert.equal(held.shelfAccepted, 0);
    });
    return { layout, hub, mounted, afterDriftAndPulse, suspended, suspendedHold, resumed, hold };
  }
  return { snapshot, proveFirstMount, prepareThirdRead, revisit };
}

const firstReadLoop = ' for(let index=0;index<3;index++){';
const loopStart = " await page.keyboard.down('q');\n" + firstReadLoop;
const noBrowserErrors = ' assert.deepEqual(errors,[]);assert.equal(sourceIdentity(root).fingerprint,identity.fingerprint);';
let source = replaceOnce(harness, 'createServer({root,server:', 'createServer({root,cacheDir:process.env.CC01_VITE_CACHE,server:');
source = replaceOnce(source,
  "{waitUntil:'networkidle'});await page.waitForFunction(()=>window.__SURFACE_RESPONSE__?.isRunning);",
  "{waitUntil:'networkidle',timeout:180000});await page.waitForFunction(()=>window.__SURFACE_RESPONSE__?.isRunning,null,{timeout:90000});");
source = replaceOnce(source, loopStart, [
  ' const cc01 = await (' + installProbes.toString() + ')(page, steps, tap, check, assert);',
  ' const cc01FirstMount = await cc01.proveFirstMount();',
  ' let cc01BeforeThird;',
  loopStart,
  '  if (index === 2) cc01BeforeThird = await cc01.prepareThirdRead();'
].join('\n'));
source = replaceOnce(source, ' const vascularCompleted=await vascularState();',
  ' const vascularCompleted=await vascularState();\n const cc01Completed = await cc01.snapshot();');
source = replaceOnce(source, noBrowserErrors,
  ' const cc01Revisit = await cc01.revisit(cc01FirstMount, cc01BeforeThird, cc01Completed);\n' + noBrowserErrors);
source = replaceOnce(source, 'const report={pass:', [
  'const report={cc01:{',
  'classification:"Native first-visit recovery with forming anatomy, then earned residual settling on the completed revisit.",',
  'approach:"Staged positions and region-only debug entries. Progress, placement, drift and returns use runtime owners.",',
  'firstMount:cc01FirstMount,beforeThird:cc01BeforeThird,completed:cc01Completed,revisit:cc01Revisit},',
  'pass:'
].join(''));

const layouts = ['deep', 'neutral', 'deep-swap'];
async function runLayout(layout) {
  const caseReport = report.replace(/(?:\.json)?$/, '-' + layout + '.json');
  const result = await new Promise((accept, reject) => {
    const child = spawn(process.execPath, ['--input-type=module', '-'], {
      cwd: root,
      stdio: ['pipe', 'inherit', 'inherit'],
      env: { ...process.env, BLOB_BOT_REPORT: caseReport, CC01_TEST_LAYOUT: layout,
        CC01_VITE_CACHE: caseReport + '.vite-cache', CORE_REPAIR_BROWSER_TRIAL: '0' }
    });
    const timer = setTimeout(() => child.kill(), 720_000);
    child.on('error', reject);
    child.stdin.on('error', reject);
    child.on('close', status => { clearTimeout(timer); accept(status); });
    child.stdin.end(source);
  });
  assert.equal(result, 0, 'Earned journey failed. Check ' + caseReport + '.failure.json');
  const evidence = JSON.parse(readFileSync(caseReport, 'utf8'));
  assert.deepEqual(evidence.summary, { passed: 34, failed: 0 });
  return { caseReport, evidence };
}

const selected = process.argv[2];
assert.ok(selected === undefined || layouts.includes(selected), 'Expected deep, neutral or deep-swap');
if (selected) {
  await runLayout(selected);
} else {
  // Each layout earns its own state. Starting residues and read history are
  // compared across independent journeys, without restoring or seeding either.
  const deep = await runLayout('deep');
  const neutral = await runLayout('neutral');
  const swap = await runLayout('deep-swap');
  const before = item => item.evidence.cc01.revisit.hold.before;
  const held = item => item.evidence.cc01.revisit.hold.held;
  for (const item of [neutral, swap]) {
    assert.equal(item.evidence.sourceIdentity.fingerprint, deep.evidence.sourceIdentity.fingerprint);
    assert.equal(before(item).turbulence, before(deep).turbulence);
    assert.equal(before(item).integrity, before(deep).integrity);
    assert.equal(before(item).readSequence, before(deep).readSequence);
    assert.equal(before(item).reserve, before(deep).reserve);
  }
  assert.deepEqual(held(swap).traits, held(deep).traits);
  assert.equal(held(swap).turbulence, held(deep).turbulence);
  assert.equal(held(swap).reserve, held(deep).reserve);
  assert.equal(held(swap).calm.factor, held(deep).calm.factor);
  assert.ok(held(deep).turbulence < held(neutral).turbulence);
  const journeys = [deep, neutral, swap].map(({ caseReport, evidence }) => ({
    report: caseReport, checks: evidence.summary.passed, layout: evidence.cc01.revisit.layout
  }));
  writeFileSync(report, JSON.stringify({ journeys, crossReplayParity: 'PASS' }, null, 2) + '\n');
  console.log('CC01 lifecycle passed (102 checks plus cross-replay parity). Evidence: ' + report);
}
