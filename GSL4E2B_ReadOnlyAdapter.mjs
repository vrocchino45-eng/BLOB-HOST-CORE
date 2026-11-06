// GSL-4E2B: read-only LS1 interpretation; never mutates the supplied frame.
export class GSL4E2BReadOnlyAdapter {
  constructor() { this.previousActive = null; this.concernUntil = 0; this.supportUntil = 0; this.lastEvent = "none"; }
  sample(frame, now) {
    const a = frame?.playerAttachment;
    const active = typeof a?.active === "boolean" ? a.active : null;
    const reason = typeof a?.detachReason === "string" ? a.detachReason : "";
    if (this.previousActive === true && active === false) {
      if (reason === "deliberate_away_input") { this.lastEvent = "deliberate_release"; this.concernUntil = 0; }
      else if (reason && reason !== "none") { this.lastEvent = "unexpected_loss"; this.concernUntil = now + 1.8; }
      else this.lastEvent = "unknown_release"; // Do not infer an alarm without authoritative reason.
    }
    if (this.previousActive === false && active === true) { this.lastEvent = "attachment_recovered"; this.supportUntil = now + 1.3; this.concernUntil = 0; }
    if (active !== null) this.previousActive = active;
    return Object.freeze({mode: now < this.concernUntil ? "concern" : now < this.supportUntil ? "support" : "companion", event: this.lastEvent, active, reason});
  }
}
