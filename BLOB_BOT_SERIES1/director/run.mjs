import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import { createServer } from 'vite';
import { chromium } from 'playwright';
import { sourceIdentity } from '../source-identity.mjs';
import { ACTIVE_CHECKPOINT, loadScenario } from './scenario-contract.mjs';
import { buildCompatibility, readBuildIdentity } from './build-compatibility.mjs';

const root = path.resolve(import.meta.dirname, '../..');
const DEFAULT_LAYOUTS = ['deep', 'balanced', 'membrane'];
const baselineInventory = () => sourceIdentity(root).fingerprint;
const write = (file, data) => writeFile(file, JSON.stringify(data, null, 2) + '\n', { flag: 'wx' });

function parse(args) {
  const [outArg, mode = '--all', layout] = args;
  if (!outArg || !['--all', '--pilot', '--objective', '--prepare'].includes(mode) || (layout && !DEFAULT_LAYOUTS.includes(layout))) {
    throw new Error('Usage: node BLOB_BOT_SERIES1/director/run.mjs <new-output-dir> [--all | --pilot [layout] | --objective layout | --prepare layout]');
  }
  const out = path.resolve(outArg);
  const rel = path.relative(root, out);
  if (!rel || (!rel.startsWith('..' + path.sep) && rel !== '..' && !path.isAbsolute(rel))) {
    throw new Error('Use an external output directory');
  }
  return { out, mode, layout: layout ?? 'deep' };
}

function inputAdapter() {
  const original = navigator.getGamepads.bind(navigator);
  const pad = { lt: 0, rt: 0, override: true };
  window.__DIRECTOR_PAD__ = pad;
  Object.defineProperty(navigator, 'getGamepads', {
    configurable: true,
    value() {
      if (!pad.override) return original();
      return [{ id: 'Director standard fixture', index: 0, mapping: 'standard', connected: true,
        timestamp: performance.now(), axes: [0, 0, 0, 0], buttons: Array.from({ length: 17 }, (_, index) => {
          const value = index === 6 ? pad.lt : index === 7 ? pad.rt : 0;
          return { value, pressed: value > 0.5, touched: value > 0 };
        }) }];
    }
  });
}

export function verifyStart(scenario, start) {
  const { state, retained, patch } = start;
  const starting = scenario.authoritative;
  assert.equal(state.step.hostId, scenario.environment.host);
  assert.equal(state.step.cellId, scenario.environment.cell);
  assert.ok(state.step.mountSequence > 0);
  assert.equal(patch.id, scenario.environment.receiver);
  assert.deepEqual(state.pose, patch.center.map((v, i) => v + scenario.environment.offset[i]));
  assert.deepEqual(state.facing, scenario.environment.facing);
  assert.equal(state.reserve, starting.core.reserve);
  assert.deepEqual(retained.pieces.map(p => p.zoneId), starting.core.placements);
  assert.equal(retained.topology.complete, true);
  assert.equal(retained.chemistry.seedCount, 1);
  assert.equal(retained.material.mass, starting.material.totalMass);
  assert.equal(retained.material.nativeAwake, false);
  assert.deepEqual(retained.material.records.map(r => r.id), starting.material.ids);
  assert.deepEqual(retained.material.units.map(r => r.id), starting.material.ids);
  assert.ok(retained.material.units.every(r => r.generation === starting.material.generation && r.phase === 'reservoir'));
  assert.ok(Object.values(retained.progression).every(value => value === false || value === 0));
  assert.ok(Object.values(retained.receipts).every(value => value === starting.regional.receipts));
  assert.equal(state.imprint, starting.regional.imprint);
  assert.equal(state.attachment, false);
  assert.equal(retained.grip, null);
  assert.equal(retained.seat, null);
  assert.equal(state.camera.near, false);
  assert.equal(state.camera.yaw, scenario.presentation.yaw);
  assert.equal(state.camera.pitch, scenario.presentation.pitch);
  assert.ok(state.camera.withinFrustum);
  assert.equal(state.aim, null);
  assert.ok(!state.input.stabilize && !state.input.absorb && !state.input.flowDemand);
  assert.ok(!state.flow?.effect && !state.flow?.extension && !state.flow?.strain);
}

function score(scenario, value) {
  try {
    verifyStart(scenario, value.start);
  } catch (error) {
    return { status: 'INVALID_SETUP', reason: error.message };
  }
  const start = value.start.retained;
  const finish = value.final.retained;
  const missing = scenario.requiredActions.filter(action => !value.actions[action]);
  const violations = [];
  for (const key of ['material', 'progression', 'receipts', 'grip', 'seat']) {
    try { assert.deepEqual(finish[key], start[key]); } catch { violations.push(key); }
  }
  if (value.invariantViolation) violations.push(value.invariantViolation);
  if (value.samples.some(s => s.input.absorb || s.input.pulseEventId !== value.start.state.input.pulseEventId)) {
    violations.push('Flow action leaked into Absorb or Pulse');
  }
  const maximum = field => Math.max(...value.samples.map(field));
  const frames = value.samples.filter(s => s.step?.substep === 0);
  const accepted = value.samples.filter(s => s.flow?.effect?.acceptedCurrent01 > 0);
  if (accepted.some(s => s.settlement?.status !== 'settled' || s.settlement?.actionSequence !== s.flow.effect.actionSequence)) {
    violations.push('Accepted Flow missing matching reserve settlement');
  }
  const data = {
    missing, violations, dose: value.pressureDose, currentDose: value.currentDose, secondsToRelease: value.final.stoppingAt,
    reserveAtStart: value.start.state.reserve, reserveAtEnd: value.final.state.reserve,
    inputEdges: value.probes.map(({ elapsed, lt, rt }) => ({ elapsed, lt, rt })),
    directFlowDebit: value.samples.reduce((sum, sample) => sum + (sample.settlement?.actualDebit ?? 0), 0),
    strainPeak: maximum(s => s.flow?.strain ?? 0), strainAtEnd: value.final.state.flow?.strain ?? 0,
    imprintAtEnd: value.final.state.imprint, acceptedImprintGain: value.acceptedImprintGain, maxTravelFromStart: maximum(s =>
      Math.hypot(...s.pose.map((v, axis) => v - value.start.state.pose[axis]))),
    maximumAuthorityStep: maximum(s => s.dt), simulationSteps: value.samples.length,
    observedFrames: frames.length, simulatedTimeDroppedMs: frames.reduce((sum, row) => sum + row.droppedFrameMs, 0),
    acceptedSteps: accepted.length, acceptedInFrustum: accepted.filter(s => s.camera.withinFrustum).length,
    acceptedFirstReserve: accepted[0]?.reserve ?? null, releaseReserve: value.samples.find(s => s.step?.frame === value.actions.release?.frame
      && s.step?.substep === value.actions.release?.substep)?.reserve ?? null,
    acceptedLastReserve: accepted.at(-1)?.reserve ?? null
  };
  if (violations.length) return { status: 'FAIL', ...data };
  if (missing.length) return { status: 'NOT_EXERCISED', ...data };
  const target = value.policy === 'objective' ? scenario.acceptance.dose : scenario.acceptance.minimumDose;
  return { status: value.pressureDose + 1e-8 >= target && data.imprintAtEnd > 0 ? 'PASS' : 'FAIL', ...data };
}

function controls(data) {
  const { step, pose, facing, camera, reserve, corePhaseCount } = data.start.state;
  const { pieces, chemistry, material, progression, receipts, grip, seat } = data.start.retained;
  return { location: [step.hostId, step.cellId], pose, facing, camera, reserve,
    corePhaseCount, pieceIdentity: pieces.map(({ pieceId, family }) => [pieceId, family]),
    chemistry, material, progression, receipts, grip, seat, patch: data.start.patch };
}

async function probeOrdinary(browser, origin) {
  const control = await browser.newContext();
  const page = await control.newPage();
  await page.goto(origin, { waitUntil: 'domcontentloaded' });
  await page.locator('canvas').first().waitFor({ state: 'attached', timeout: 60_000 });
  await page.waitForFunction(() => document.querySelector('canvas')?.width > 0);
  const proof = await page.evaluate(() => {
    const key = '__director_isolation_witness__';
    localStorage.setItem(key, 'ordinary-context-only');
    return { key, value: localStorage.getItem(key), hasDirectorPad: '__DIRECTOR_PAD__' in window,
      hasDirectorRuntime: '__DIRECTOR_RUNTIME__' in window, hasOverlay: Boolean(document.querySelector('#director-sync')),
      startupFlowFlag: new URLSearchParams(location.search).has('flow') };
  });
  assert.ok(!proof.hasDirectorPad && !proof.hasDirectorRuntime && !proof.hasOverlay && !proof.startupFlowFlag);
  await page.close();
  return { context: control, close: () => control.close(), proof };
}

async function execute(browser, origin, scenario, mode, out, { playable = false, build } = {}) {
  const clip = path.join(out, scenario.id + '-' + mode);
  await mkdir(clip);
  const { width, height } = scenario.presentation;
  const settings = { viewport: { width, height }, deviceScaleFactor: 1 };
  if (!playable) settings.recordVideo = { dir: clip, size: { width, height } };
  const context = await browser.newContext(settings);
  await context.addInitScript(inputAdapter);
  const page = await context.newPage();
  const started = Date.now();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const video = page.video();
  let evidence, failure, isolation;
  try {
    await page.route('**/src/main.js', async route => {
      const response = await route.fetch();
      await route.fulfill({ response, body: (await response.text()) + '\nwindow.__DIRECTOR_RUNTIME__ = runtime;\n' });
    });
    await page.goto(origin + '/?flow=1', { waitUntil: 'networkidle', timeout: 60_000 });
    await page.waitForFunction(() => window.__DIRECTOR_RUNTIME__?.isRunning, null, { timeout: 60_000 });
    isolation = await page.evaluate(() => ({ storageKeys: Object.keys(localStorage), sessionKeys: Object.keys(sessionStorage) }));
    assert.deepEqual(isolation.sessionKeys, []);
    assert.ok(isolation.storageKeys.every(key => key.startsWith('blob.telemetry.session.')), 'Normal player storage entered the trial');
    await page.keyboard.press('Shift+Digit6');
    await page.waitForFunction(() => {
      const r = window.__DIRECTOR_RUNTIME__;
      return r.siltPressureRouteSystem?.active && r.siltPressureRouteSystem.territoryExpansion?.readFlowPatch(r.frameState);
    }, null, { timeout: 75_000 });
    if (!await page.evaluate(() => window.__DIRECTOR_RUNTIME__.frameState.coreGrowth?.debugCoreWorkRetainedAnatomySeeded === true)) {
      await page.keyboard.press('p');
    }
    await page.waitForFunction(() => {
      const f = window.__DIRECTOR_RUNTIME__.frameState;
      return f.coreGrowth?.debugCoreWorkRetainedAnatomySeeded === true && f.spatialCoreChemistry?.retainedPieceCount === 3;
    }, null, { timeout: 75_000 });
    await page.evaluate(async ({ scenario, mode, playable }) => {
      const { installShelfTrial } = await import('/BLOB_BOT_SERIES1/director/shelf-tape.mjs');
      window.__DIRECTOR_EVIDENCE__ = installShelfTrial(window.__DIRECTOR_RUNTIME__, scenario, mode, window.__DIRECTOR_PAD__, { playable });
    }, { scenario, mode, playable });

    await page.waitForFunction(() => window.__DIRECTOR_EVIDENCE__?.final || window.__DIRECTOR_EVIDENCE__?.status,
      null, { timeout: 95_000 });
    evidence = await page.evaluate(() => ({
      ...window.__DIRECTOR_EVIDENCE__, timeOrigin: performance.timeOrigin, device: navigator.userAgent
    }));
    if (playable) {
      verifyStart(scenario, evidence.start);
      await page.evaluate(() => { window.__DIRECTOR_PAD__.override = false; });
      console.log(JSON.stringify({ ready: scenario.id, note: 'Physical input passed through. Close the browser window to exit.' }));
      await page.waitForEvent('close', { timeout: 0 });
    } else {
      await page.evaluate(() => new Promise(resolve => {
        requestAnimationFrame(() => requestAnimationFrame(resolve));
      }));
      await page.waitForTimeout(650); // retain the final visual anchor after a full paint
    }
  } catch (error) {
    failure = { message: error.message, stack: error.stack };
    if (!page.isClosed()) {
      const state = await page.evaluate(() => {
        const r = window.__DIRECTOR_RUNTIME__;
        const f = r?.frameState;
        return { activeCell: f?.activeCellId, active: r?.siltPressureRouteSystem?.active,
          isRunning: r?.isRunning, frame: f?.frame, flow: f?.coreFlow, lastInput: f?.input,
          seed: f?.coreGrowth?.debugCoreWorkRetainedAnatomySeeded,
          partialTrial: window.__DIRECTOR_EVIDENCE__ };
      }).catch(() => null);
      failure.diagnostic = state;
    }
  } finally {
    await context.close();
  }
  const videoFile = video ? path.join(clip, 'gameplay.webm') : null;
  if (video) await video.saveAs(videoFile);
  const evaluation = failure || errors.length
    ? { status: 'INVALID_SETUP', reason: failure?.message ?? errors.join('; ') }
    : playable ? { status: 'NOT_EXERCISED', reason: 'Prepared for manual takeover' } : score(scenario, evidence);
  const outcome = { build, scenario, mode, started, elapsedWallMs: Date.now() - started, isolation,
    video: videoFile, evaluation, failure, errors, evidence };
  await write(path.join(clip, 'trial.json'), outcome);
  console.log(JSON.stringify({ scenario: scenario.id, mode, ...evaluation, dir: clip }));
  return outcome;
}

async function main() {
  const { out, mode, layout } = parse(process.argv.slice(2));
  const build = readBuildIdentity(root, ACTIVE_CHECKPOINT);
  const { commit: head } = build;
  await mkdir(out);
  const admission = buildCompatibility(build, ACTIVE_CHECKPOINT);
  if (admission.status !== 'PASS') {
    await write(path.join(out, 'runs.json'), { ...admission, head, build });
    console.error(admission.code + ': ' + admission.errors.join(', '));
    return false;
  }
  const identity = baselineInventory();
  const chosen = mode === '--all' ? DEFAULT_LAYOUTS : [layout];
  const definitions = [];
  for (const name of chosen) {
    const result = await loadScenario(new URL('./scenarios/' + name + '.json', import.meta.url), build);
    if (result.status !== 'PASS') {
      await write(path.join(out, 'runs.json'), { ...result, head, build });
      return false;
    }
    definitions.push(result.scenario);
  }
  // The authorized three-way experiment varies arrangement only.
  const comparable = (scenario) => {
    const { id, authoritative, ...rest } = scenario;
    const { core, ...restState } = authoritative;
    const { placements, ...coreControl } = core;
    return { ...rest, authoritative: { ...restState, core: coreControl } };
  };
  for (const entry of definitions.slice(1)) assert.deepEqual(comparable(entry), comparable(definitions[0]));

  const server = await createServer({ root, server: { host: '127.0.0.1', port: 0, hmr: false }, logLevel: 'warn' });
  let browser, ordinary;
  try {
    await server.listen();
    const origin = 'http://127.0.0.1:' + server.httpServer.address().port;
    const executablePath = process.env.BLOB_BOT_CHROMIUM_EXECUTABLE;
    const launch = { headless: mode !== '--prepare', args: JSON.parse(process.env.BLOB_BOT_CHROMIUM_ARGS ?? '[]') };
    if (executablePath) launch.executablePath = executablePath;
    browser = await chromium.launch(launch);
    if (mode !== '--prepare') ordinary = await probeOrdinary(browser, origin);
    const runs = [];
    for (const comparison of mode === '--all' ? ['input', 'objective'] : mode === '--objective' ? ['objective'] : ['input']) {
      for (const scenario of definitions) runs.push(await execute(browser, origin, scenario, comparison, out, { playable: mode === '--prepare', build }));
    }
    let parity = false;
    let parityError = null;
    if (runs.every(run => run.evidence?.start)) {
      try {
        const first = controls(runs[0].evidence);
        for (const run of runs.slice(1)) assert.deepEqual(controls(run.evidence), first);
        parity = true;
      } catch (error) { parityError = error.message; }
    }

    let ordinaryStorageIntact = null;
    if (ordinary) {
      const page = await ordinary.context.newPage();
      await page.goto(origin, { waitUntil: 'domcontentloaded' });
      ordinaryStorageIntact = await page.evaluate(({ key, value }) =>
        localStorage.getItem(key) === value && !('__DIRECTOR_PAD__' in window), ordinary.proof);
      await page.close();
    }
    const productionSourcesIdentical = baselineInventory() === identity;
    const pass = runs.every(run => run.evaluation.status === 'PASS') && parity && ordinaryStorageIntact && productionSourcesIdentical;
    await write(path.join(out, 'runs.json'), {
      schema: 'blob.director-runs.v1', head, build, scenarioRevisions: definitions.map(({ id, schema, revision }) => ({ id, schema, revision })), sourceFingerprint: identity, status: pass ? 'PASS' : 'FAIL',
      mode, stagingDeclared: true, productionSourcesIdentical, startingStateParity: parity, parityError,
      ordinary: ordinary && { ...ordinary.proof, storageIntact: ordinaryStorageIntact },
      runs: runs.map(({ scenario, mode, evaluation, video }) => ({ scenario: scenario.id, mode, evaluation, video }))
    });
    return Boolean(pass || mode === '--prepare' && runs.every(r => r.evaluation.status === 'NOT_EXERCISED'));
  } finally {
    if (ordinary) await ordinary.close();
    if (browser) await browser.close();
    await server.close();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try { process.exitCode = Number(!await main()); }
catch (error) { console.error(error.stack); process.exitCode = 1; }
}
