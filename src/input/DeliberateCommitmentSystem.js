/**
 * HC028D2 — Deliberate Commitment Grammar
 *
 * A/E is reserved for intentional commitment. This system does not invent
 * commitment opportunities and does not own input mapping, movement, verbs,
 * routes, chemistry, or Core Work. It simply publishes whether a world A press
 * had an explicitly authored commitment offer available.
 *
 * Ordinary observation, scanning, route returns and physical manipulation are
 * expressed by movement / Pulse / Absorb / Stabilize / resolved world state.
 */
export class DeliberateCommitmentSystem {
  constructor({ frameState }) {
    this.frameState = frameState;
    this.eventSequence = 0;
    this.lastInteractEventId = -1;
  }

  init() {
    this.publish(this.frameState);
  }

  update(_dt, frameState = this.frameState) {
    const input = frameState.input ?? {};
    const offer = frameState.commitmentOpportunity ?? {};
    const offered = Boolean(offer.available);
    const eventId = Number.isFinite(input.interactEventId)
      ? input.interactEventId
      : (input.interactPressed ? (frameState.frame ?? 0) : -1);
    const freshWorldPress = Boolean(
      input.interactPressed
      && input.primaryActionContext !== "core_work"
      && !(input.stabilizeHeld || input.resonanceHeld)
      && eventId !== this.lastInteractEventId
    );
    if (freshWorldPress) this.lastInteractEventId = eventId;

    let status = offered ? "commitment_available" : "reserved_no_commitment";
    let committed = false;
    let emittedEvent = null;

    if (freshWorldPress && offered) {
      committed = true;
      status = "deliberate_commitment_expressed";
      this.eventSequence += 1;
      emittedEvent = {
        pass: "HC-028D2",
        eventId: `hc028d2_commit_${this.eventSequence}`,
        kind: offer.kind ?? "authored_commitment",
        targetId: offer.targetId ?? "none",
        sourceId: offer.sourceId ?? "none",
        frame: frameState.frame ?? 0,
        persistentIntent: true,
        consequenceAuthority: false
      };
      frameState.deliberateCommitmentEvent = emittedEvent;
    } else if (freshWorldPress) {
      status = "reserved_press_no_authored_commitment";
      frameState.deliberateCommitmentEvent = null;
    }

    this.publish(frameState, { offered, offer, freshWorldPress, committed, status, emittedEvent });
  }

  publish(frameState, detail = {}) {
    const offer = detail.offer ?? frameState.commitmentOpportunity ?? {};
    frameState.deliberateCommitment = {
      pass: "HC-028D2",
      active: true,
      button: "A / E",
      role: "deliberate_commitment_not_generic_interact",
      available: Boolean(detail.offered ?? offer.available),
      kind: offer.kind ?? "none",
      targetId: offer.targetId ?? "none",
      status: detail.status ?? "reserved_no_commitment",
      freshPress: Boolean(detail.freshWorldPress),
      committed: Boolean(detail.committed),
      eventId: detail.emittedEvent?.eventId ?? "none",
      grammar: {
        movement: "position",
        pulseAbsorbStabilize: "physical_relationship",
        aButton: "meaningful_or_persistent_choice_only",
        coreWorkA: "intentional_internal_arrangement"
      },
      authority: {
        inputMapping: false,
        movement: false,
        verbPower: false,
        routeCompletion: false,
        chemistry: false,
        coreWork: false,
        presentation: false
      }
    };
  }
}
