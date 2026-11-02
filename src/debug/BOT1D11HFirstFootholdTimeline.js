// BOT1-D11H: read-only 25ms first-foothold telemetry. No runtime owner writes.
// A phase transition is observed after the fact, never claimed to be an intercepted method call.
const TARGET = 'SILT_ENTRY_SEDIMENT_SHELF_D11B';
const round = (v) => Number.isFinite(v) ? Number(v.toFixed(4)) : null;
const xyz = (v) => v && Number.isFinite(v.x) && Number.isFinite(v.y) && Number.isFinite(v.z)
  ? { x: round(v.x), y: round(v.y), z: round(v.z) } : null;

export function installBOT1D11HFirstFootholdTimeline(runtime) {
  const intervalMs = 25;
  const maxSamples = 2500;
  let origin = performance.now();
  let stopped = false;
  const samples = [];
  const owner = () => runtime.coreTendrilSurfaceContactSystem;
  function snapshot() {
    const f = runtime.frameState ?? {};
    const truth = f.coreSurfaceTruth ?? {};
    const contact = f.coreTendrilContact ?? {};
    const plane = f.coreTendrilSupportPlane ?? {};
    const attachment = f.playerAttachment ?? {};
    const kinetics = f.playerKinematics ?? {};
    const tendrils = owner()?.tendrils ?? [];
    return {
      ms: Math.round(performance.now() - origin),
      frame: f.frame ?? null, cell: f.activeCellId ?? 'none',
      eligible: Boolean(truth.valid && truth.mechanicalEligible !== false && truth.surfaceId === TARGET),
      truth: { valid: Boolean(truth.valid), eligible: Boolean(truth.mechanicalEligible),
        surfaceId: truth.surfaceId ?? 'none', distance: round(truth.distance),
        reason: truth.reason ?? 'none', point: xyz(truth.point), normal: xyz(truth.normal) },
      core: { state: f.coreContactLanguage?.state ?? 'none',
        requested: contact.requestedContactState ?? 'none',
        actual: contact.contactState ?? 'none',
        velocity: xyz(kinetics.velocity), desiredMove: xyz(kinetics.desiredMoveVector) },
      contact: { reaching: contact.reachingCount ?? 0, sealed: contact.sealedCount ?? 0,
        peeling: contact.peelingCount ?? 0, supportCount: contact.surfaceLocomotion?.supportCount ?? 0,
        surfaceTruthActive: Boolean(contact.surfaceTruthActive),
        ownerContactAge: round(owner()?.contactAge), ownerPreviousState: owner()?.previousContactState ?? 'none' },
      plane: { active: Boolean(plane.active), supportCount: plane.supportCount ?? 0,
        reason: plane.reason ?? 'none' },
      attachment: { active: Boolean(attachment.active), state: attachment.state ?? 'none',
        reason: attachment.detachReason ?? 'none', gap: Boolean(attachment.contactGapActive) },
      tendrils: tendrils.map(t => ({ index: t.index, phase: t.phase,
        phaseAge: round(t.phaseAge), seal: round(t.seal),
        reachOrigin: t.reachOrigin ?? 'unreported', reachTo: xyz(t.reachTo),
        reachFrom: xyz(t.reachFrom), anchorWorld: xyz(t.anchorWorld),
        reachSurface: t.reachSurface?.valid ? t.reachSurface.surfaceId : 'none',
        anchorSurface: t.anchorSurface?.valid ? t.anchorSurface.surfaceId : 'none',
        pendingSurface: t.pendingSurface?.valid ? t.pendingSurface.surfaceId : 'none',
        pendingAnchorValid: Boolean(t.pendingAnchorValid) }))
    };
  }
  function collect() {
    if (stopped || samples.length >= maxSamples) return;
    samples.push(snapshot());
  }
  const timer = setInterval(collect, intervalMs);
  collect();
  return Object.freeze({
    reset() { origin = performance.now(); samples.length = 0; stopped = false; collect(); },
    dump() { collect(); return {
      revision: 'BOT1-D11H-1', intervalMs, maxSamples, samples: samples.slice(),
      samplingNote: 'Post-update read-only sampling; reach attempts rejected before a state transition are not directly observable.',
      ownerDataUsedForSteering: false
    }; },
    stop() { stopped = true; clearInterval(timer); }
  });
}
