/**
 * BLOB: HOST CORE — C0C5-A1 read-only REC1 causal field audit.
 * Does not reconstruct gameplay, authenticate source truth independently,
 * or claim proof of browser build revision from a JSON export.
 *
 * Usage: node scripts/analyzeC0C5Recording.mjs "path/to/REC1.json" [--out "path/to/report.json"]
 * Exit: 0 no contradictions and observed chain; 2 contradiction; 3 incomplete evidence; 1 invalid input.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const SOURCE_CELL = 'CELL_SILT_PRESSURE_ROUTE_001';
const VASCULAR_CELL = 'CELL_VASCULAR_RHYTHM_ROUTE_001';
const RECEIPT_ID = new RegExp(`^${SOURCE_CELL}:silt-trajectory:([1-9][0-9]*)$`);
const EPS = 0.00012;
const finite3 = a => Array.isArray(a) && a.length === 3 && a.every(Number.isFinite);
const isPlainObject = x => x !== null && typeof x === 'object' && !Array.isArray(x);
const close = (a, b, delta = EPS) => Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) <= delta;
const record = (name, ok, level, detail = '') => ({ name, status: ok ? 'PASS' : level, detail });
const uniq = xs => new Set(xs).size === xs.length;
const isOrigin = r => isPlainObject(r) && r.schemaVersion === 1 && r.kind === 'silt_material_disturbance_observed'
  && r.sourceCellId === SOURCE_CELL && r.sourceSystem === 'SiltPressureRouteSystem'
  && r.effectType === 'observed_only' && r.targetCellId === null
  && r.materialTransfer === false && r.routeCredit === false && r.worldConsequence === false
  && /^silt-grain-0[1-8]$/.test(r.subjectId ?? '') && Number.isSafeInteger(r.sourceReceiptSequence)
  && r.sourceReceiptSequence >= 1 && r.id === `${SOURCE_CELL}:silt-trajectory:${r.sourceReceiptSequence}`
  && finite3(r.origin) && finite3(r.releaseVelocity) && Number.isSafeInteger(r.sequence) && r.sequence > 0;

/** Pure recording examination. All absent evidence becomes INCOMPLETE, not false PASS. */
export function analyzeC0C5Recording(data) {
  if (!isPlainObject(data) || !Array.isArray(data.events)) throw new Error('Expected REC1 JSON object with an events array');
  const checks = [];
  const pass = (name, ok, detail, level = 'FAIL') => checks.push(record(name, ok, level, detail));
  const incomplete = (name, found, detail) => pass(name, found, detail, 'INCOMPLETE');
  const events = data.events;
  const summary = isPlainObject(data.summary) ? data.summary : {};
  const count = events.length;
  const retention = summary.captureRetention ?? {};
  const ordinals = events.map(e => e?.recorderEventOrdinal);
  const sequential = ordinals.every((n, i) => n === i + 1);
  const dropped = retention.droppedDetails;
  const retentionFields = Number.isInteger(retention.totalEventsObserved) && Number.isInteger(retention.retainedDetails) && Number.isInteger(dropped);
  incomplete('recorder retention counters present', retentionFields, 'REC1 counters required to rule out truncation');
  if (retentionFields) pass('recorder retention exact', retention.totalEventsObserved === count && retention.retainedDetails === count && dropped === 0 && retention.fullSessionRecorderDetailsRetained === true,
    `observed=${retention.totalEventsObserved}, retained=${retention.retainedDetails}, dropped=${dropped}, events=${count}`);
  pass('recorder consecutive ordinals', sequential && count > 0, `observed events=${count}, ordinal first=${ordinals[0] ?? 'none'}, last=${ordinals.at(-1) ?? 'none'}`);
  incomplete('REC1 full-session schema', data.recorderRevision === 'C0C-REC1' && data.recorderSchemaVersion >= 2,
    `recorder=${data.recorderRevision ?? 'unknown'}, schema=${data.recorderSchemaVersion ?? 'unknown'}`);

  const byType = type => events.filter(e => e?.type === type);
  const decisions = byType('silt-authoritative-route-decision').map(e => e.decision).filter(isPlainObject);
  const releases = decisions.filter(d => d.kind === 'silt-trajectory' && d.outcome === 'released-with-trajectory');
  const releaseEvents = byType('silt-authoritative-route-decision').filter(e => e.decision?.kind === 'silt-trajectory' && e.decision?.outcome === 'released-with-trajectory');
  const releaseOrdinalBySeq = new Map(releaseEvents.map(e => [e.decision.sequence, e.recorderEventOrdinal]));
  const causeEvents = byType('host-silt-cause-observed');
  const causeOrdinalById = new Map(causeEvents.map(e => [e.cause?.id, e.recorderEventOrdinal]));
  const releaseBySeq = new Map(releases.map(d => [d.sequence, d]));
  const causes = causeEvents.map(e => e.cause);
  const ledger = summary.hostConnections?.finalState;
  const baseLedger = byType('authority-baseline')[0]?.state?.hostConnections;
  const ledgerRecords = Array.isArray(ledger?.records) ? ledger.records : [];
  const baselineRecords = Array.isArray(baseLedger?.records) ? baseLedger.records : [];
  const sourceRecords = [...causes, ...ledgerRecords, ...baselineRecords];
  const sourceById = new Map();
  for (const r of sourceRecords) if (isPlainObject(r) && typeof r.id === 'string') sourceById.set(r.id, r);
  const malformedSources = sourceRecords.filter(r => !isOrigin(r));
  pass('no malformed observed source receipts', malformedSources.length === 0, `inspected=${sourceRecords.length}, malformed=${malformedSources.length}`);
  const uniqueCauseEvents = uniq(causes.map(r => r?.id));
  pass('observed source event ids unique', uniqueCauseEvents, `observed source events=${causes.length}`);
  const conflictingObservedCauses = causes.filter(r => {
    const d = releaseBySeq.get(r?.sourceReceiptSequence);
    return d && d.unitId !== r.subjectId;
  });
  pass('matched Silt release identity not contradicted', conflictingObservedCauses.length === 0,
    `cause/release subject conflicts=${conflictingObservedCauses.length}`);
  const unmatchedObservedCauses = causes.filter(r => {
    const d = releaseBySeq.get(r?.sourceReceiptSequence);
    return !d || d.unitId !== r.subjectId || d.outcome !== 'released-with-trajectory';
  });
  if (causes.length) incomplete('observed causes linked to recorded Silt releases', unmatchedObservedCauses.length === 0,
    `observed=${causes.length}, unmatched=${unmatchedObservedCauses.length}; pre-capture sources cannot be replay-proven`);
  else incomplete('Silt source receipts observed in recording', false, 'No new Silt source event observed in this capture');
  const spuriousReceipts = releases.filter(d => !Number.isSafeInteger(d.sequence) || d.sequence < 1);
  pass('recorded release sequence valid', spuriousReceipts.length === 0, `release events=${releases.length}`);
  // Contact pressure and unbound pulses are not sources. The above cause/release join
  // rules out a contact-only false source when the full producer trace was captured.
  const contactPresses = decisions.filter(d => d.kind === 'silt-contact' && d.outcome === 'contact-pressed');
  const imprintEvents = decisions.filter(d => d.kind === 'silt-contact' && d.outcome === 'temporary-imprint-formed');
  if (contactPresses.length) pass('contact does not masquerade as release',
    causes.every(r => releaseBySeq.has(r.sourceReceiptSequence)),
    `contact presses=${contactPresses.length}, imprints=${imprintEvents.length}, matched origin causes=${causes.length}`,
    'INCOMPLETE');

  const sourceTimeViolations = causeEvents.filter(e => {
    const releaseOrdinal = releaseOrdinalBySeq.get(e.cause?.sourceReceiptSequence);
    return Number.isSafeInteger(releaseOrdinal) && e.recorderEventOrdinal <= releaseOrdinal;
  });
  pass('observed cause occurs after Silt release', sourceTimeViolations.length === 0,
    `time-order violations=${sourceTimeViolations.length}`);
  const acceptedEvents = byType('vascular-silt-signal-received');
  const received = acceptedEvents.map(e => e.receipt);
  const ids = received.map(r => r?.receiptId);
  const receiverTimeViolations = acceptedEvents.filter(e => {
    const causeOrdinal = causeOrdinalById.get(e.receipt?.receiptId);
    return Number.isSafeInteger(causeOrdinal) && e.recorderEventOrdinal <= causeOrdinal;
  });
  pass('observed receiver occurs after Host source', receiverTimeViolations.length === 0,
    `time-order violations=${receiverTimeViolations.length}`);
  pass('received-event identities unique', uniq(ids), `events=${received.length}, unique=${new Set(ids).size}`);
  pass('received-event ordinal sequence monotone', received.every((r, i) => Number.isSafeInteger(r?.sequence) && r.sequence > 0 && (i === 0 || r.sequence > received[i - 1].sequence)),
    `received event sequences: ${received.map(r => r?.sequence).join(',') || 'none'}`);
  pass('receiver cell and receipt structure', acceptedEvents.every(e => e.receiverCellId === VASCULAR_CELL && isPlainObject(e.receipt)
    && RECEIPT_ID.test(e.receipt.receiptId ?? '') && Number.isFinite(e.receipt.loadAfter)
    && e.receipt.loadAfter >= 0 && e.receipt.loadAfter <= .85),
    `receiver events=${received.length}`);
  const noOriginProof = received.filter(r => !sourceById.has(r?.receiptId));
  incomplete('receiver events match available source ledger', noOriginProof.length === 0 && received.length > 0,
    `accepted events=${received.length}, source ids not found=${noOriginProof.length}`);
  const incompatible = received.filter(r => {
    const src = sourceById.get(r?.receiptId);
    return src && (!isOrigin(src) || src.subjectId !== r?.subjectId);
  });
  pass('source to receiver identities consistent', incompatible.length === 0, `identity mismatches=${incompatible.length}`);

  const view = summary.hostConnections?.vascularLocalResponse ?? data.finalAuthority?.vascularSiltSignalResponse;
  incomplete('final Vascular owner snapshot available', isPlainObject(view), `owner=${view?.owner ?? 'missing'}`);
  if (isPlainObject(view)) {
    pass('Vascular bounds and current mathematical relation', Number.isFinite(view.membraneLoad) && view.membraneLoad >= 0 && view.membraneLoad <= .85
      && close(view.directionalFlowScale, 1 - view.membraneLoad * .085),
      `load=${view.membraneLoad}, flow=${view.directionalFlowScale}`);
    pass('Vascular forbidden-effect guards', view.noMaterialArrival === true && view.noNewMaterial === true && view.altersProgression === false
      && view.altersCadenceReads === false, `material arrival=${view.noMaterialArrival === true ? 'false' : 'UNKNOWN'}`);
    pass('Vascular receiver counts consistent', Number.isSafeInteger(view.receivedTotal) && view.receivedTotal >= received.length
      && Number.isSafeInteger(view.sourceReceiptGaps) && view.sourceReceiptGaps >= 0,
      `final received=${view.receivedTotal}, REC1 received events=${received.length}, gaps=${view.sourceReceiptGaps}`);
    if (received.length) {
      pass('receiver final receipt identity', view.lastReceiptId === received.at(-1).receiptId && view.lastSubjectId === received.at(-1).subjectId,
        `last observed=${received.at(-1).receiptId}, final=${view.lastReceiptId}`);
      incomplete('recovery after last receipt observed', view.membraneLoad + .0002 < received.at(-1).loadAfter,
        `last accepted load=${received.at(-1).loadAfter}, final load=${view.membraneLoad}; no timed recovery trace or proof of off-route behavior`);
    } else {
      incomplete('new Vascular receiver event observed', false, 'Final numeric state can reflect pre-recording receipts; not proof of new event');
    }
  }
  if (isPlainObject(ledger)) {
    pass('Host ledger is signal-only', ledger.materialTransfer === false && ledger.routeCredit === false,
      `Host accepted=${ledger.acceptedTotal ?? '?'}, rejected=${ledger.rejectedTotal ?? '?'}, duplicates=${ledger.duplicateTotal ?? '?'}`);
    pass('Host ledger continuity', Number.isSafeInteger(ledger.acceptedTotal) && ledger.acceptedTotal >= causes.length
      && ledger.records?.every(isOrigin) === true, `records=${ledger.records?.length ?? 'missing'}, observed causes=${causes.length}`);
  } else incomplete('final Host ledger snapshot available', false, 'Cannot audit final ledger');
  const baselineMass = byType('authority-baseline')[0]?.state?.cycleMass;
  const endMass = data.finalAuthority?.cycleMass;
  if (Number.isFinite(baselineMass) && Number.isFinite(endMass))
    pass('Silt cycle mass preserved', baselineMass === endMass, `start=${baselineMass}, end=${endMass}`);
  else incomplete('Silt mass conservation evidence', false, 'Missing baseline or final Silt cycleMass');

  // A recorder export contains *observations*, not trusted software attestation.
  // C0C4 source hash/production build are checked separately by local scripts.
  incomplete('C0C4 installed / Vite build attested by REC1', false,
    'Impossible to prove code revision or build success from this recording alone; run C0C4 and npm build locally');
  const failures = checks.filter(c => c.status === 'FAIL');
  const gaps = checks.filter(c => c.status === 'INCOMPLETE');
  const observedChain = causes.length > 0 && received.length > 0 && !failures.length;
  const status = failures.length ? 'FAIL' : observedChain ? 'OBSERVED_CHAIN_WITH_OPEN_GATES' : 'INCOMPLETE_FIELD_EVIDENCE';
  return {
    tool: 'C0C5-A1_READ_ONLY_CAUSAL_AUDIT', status,
    evidenceTier: 'REC1_OBSERVATION_NOT_DETERMINISTIC_REPLAY',
    recorderPass: data.pass ?? null,
    captureDurationSeconds: data.captureDurationSeconds ?? null,
    metrics: {
      recorderEvents: count, droppedRecorderDetails: dropped ?? null,
      contactPresses: contactPresses.length, temporaryImprints: imprintEvents.length,
      SiltTrajectoryReleases: releases.length, observedHostSources: causes.length,
      observedVascularReceipts: received.length,
      finalReceivedTotal: view?.receivedTotal ?? null,
      finalMembraneLoad: view?.membraneLoad ?? null,
      finalFlowScale: view?.directionalFlowScale ?? null,
    },
    counts: { passed: checks.filter(c => c.status === 'PASS').length, failed: failures.length, incomplete: gaps.length },
    checks,
    limitations: [
      'REC1 samples a producer ring; a source event lost before sampling cannot be recovered by this audit.',
      'REC1 is not a controlled input/clock/random-seed replay and does not attest which code revision generated it.',
      'A final load decline shows post-receipt recovery but does not establish elapsed mounted-frame time or perceptible visual change.',
      'Provenance receipts describe observed-only Silt releases, not inter-region physical grain transport or progression credit.'
    ]
  };
}

function usage() {
  console.error('Usage: node scripts/analyzeC0C5Recording.mjs "REC1.json" [--out "report.json"]');
  process.exitCode = 1;
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const args = process.argv.slice(2);
  if (!args.length || args[0].startsWith('--')) usage();
  else {
    try {
      const idx = args.indexOf('--out');
      if (idx >= 0 && !args[idx+1]) throw new Error('Missing --out file path');
      const report = analyzeC0C5Recording(JSON.parse(readFileSync(resolve(args[0]), 'utf8')));
      const result = JSON.stringify(report, null, 2);
      console.log(result);
      if (idx >= 0) writeFileSync(resolve(args[idx+1]), result + '\n');
      process.exitCode = report.status === 'FAIL' ? 2 : report.status === 'INCOMPLETE_FIELD_EVIDENCE' ? 3 : 0;
    } catch (e) {
      console.error(`[C0C5-A1] ${e.message}`); process.exitCode = 1;
    }
  }
}
