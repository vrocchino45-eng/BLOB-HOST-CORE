# HC031W1 Focused Playtest — Stabilized Aim + Local Contact

## Setup

Apply HC031W1 directly over HC031W, start normally, then use Shift+8 to enter the Aperture / Gathering Ground path.

## Targeting test

1. Complete the accepted Ridge → OPEN → Gathering Ground entry sequence.
2. Get near the Watcher. Center it with Right Stick until the W1 HUD shows the Watcher as candidate/attention.
3. Hold LT / Stabilize. Confirm the relationship (`R`) becomes the local Watcher rather than `gathering_ground_cluster`.
4. Keep LT held and deliberately steer Right Stick toward a nearby Relay.
5. Hold that aim briefly (~0.1 s). The relationship should hand off to the Relay rather than remaining on the Watcher or jumping to the macro territory.
6. Sweep the camera toward the broad Gathering Ground body while LT is still held. A local Watcher/Relay relationship should not be stolen by the macro territory.
7. Repeat Relay → Watcher and Relay A → Relay B at both slow and fast RS speeds.
8. Back away. A local entity relationship should not stay manipulable indefinitely outside its authored working range.

## Surface test

The HUD should report `SURF 3` in the active Aperture/Gathering Ground cell.

Try the three authored physical contexts:

- broad Watcher membrane pad;
- Relay scar-brace connector;
- Ridge-return residue pad.

Confirm the Core can physically approach/attach using the already-existing tendril/suction language. The surfaces should not become competing targeting nouns.
The pads should remain physically planted in the Host anatomy even while the nearby Watcher/Relay body animates.

## Ecology regression

Run at least one Watcher Stabilize+Pulse and one Relay Stabilize+Absorb response. U2.1 intent-latch behavior should remain unchanged. If time permits, verify LIFE 6/6 and one recurrence loop.

## Export

Press Shift+T after 3–6 minutes.

### Desired telemetry

- buildId `HC-031W1`
- schema `blob.session.telemetry.v1.52`
- `controllerTargetingStabilizeSteerRedirects > 0`
- `controllerTargetingMacroRelationshipSuppressions` may be >0 when testing the old far-macro case
- far macro relationship states should fall sharply after physical entry
- local relationship IDs should include `gathering_ground_watcher_001` and/or Relay instance IDs
- active Aperture cell reports 3 authored surfaces
- no movement-progress blocks caused by the new surfaces
- existing Gathering Ground encounters still complete normally

The main feel question is simple: while LT is held, does Right Stick now feel like you are deliberately steering the relationship to the nearby living thing you mean to work on?
