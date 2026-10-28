// BOT1-C: pure read-only classification of a Surface Wake Pulse observation.
// Never mutates packet authority, target selection, progression, or chemistry.
export function classifyWatcherPulse({pulseEventId, packetActive, packetDistance, readRange, lastAcceptedPulseEventId, packetSequence, packetIdentifiedBefore}) {
  const range = Number.isFinite(readRange) && readRange > 0 ? readRange : 3.4;
  const distance = Number.isFinite(packetDistance) ? packetDistance : null;
  const duplicateAcceptedInput = pulseEventId === lastAcceptedPulseEventId;
  const accepted = Boolean(packetActive && distance !== null && distance <= range && !duplicateAcceptedInput);
  const reason = !packetActive ? 'no_active_packet'
    : distance === null ? 'packet_distance_unavailable'
    : distance > range ? 'packet_out_of_read_range'
    : duplicateAcceptedInput ? 'pulse_id_already_accepted'
    : 'packet_pulse_read_accepted';
  return Object.freeze({
    revision:'BOT1-C', owner:'SurfaceWakeGameplaySystem', pulseEventId,
    packetSequence, packetActive:Boolean(packetActive), packetDistance:distance,
    readRange:range, packetIdentifiedBefore:Boolean(packetIdentifiedBefore),
    packetPulseReadAccepted:accepted, reason, materialTransfer:false,
    hostReceipt:false, progressionCredit:false,
    caveat:'Exact SurfaceWakeGameplaySystem packet proximity rule; not a targeting-reticle hit, physical material transfer, or completed Listening Fold.'
  });
}
