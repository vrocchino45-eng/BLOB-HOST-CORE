# LS1C0 — Universal Quick Look / World Design Inspector

- **Mode:** Prototype infrastructure and diagnostic presentation; no new gameplay.
- **Purpose:** Establish one shared, read-only, context-aware inspector across the BLOB world, with truthful status separating runtime implementation, authored design intent, and unverified visual differences.
- **Allowed:** Render a small collapsible inspection panel, read existing frameState publications for region/target/Core engine and Silt habitat/pressure/material cycle, add non-conflicting optional shortcuts and a validator.
- **Forbidden:** New raycast selection authority, changes to targeting, verbs, route progression, chemistry, materials, locomotion, geometry, tuning, world save data, or Silt ecology simulation.
- **Locks:** HC031W1 gameplay/control contracts; W2A bounded performance; W2B visual grammar; HXP2A1 retained Hub; LS1A/LS1A2 traversability/geology; LS1B conserved 8-unit material ledger and irreversible yellow packet.
- **Retire targets:** None. Avoid creating additional gameplay state stores, overlays with their own authoritative copies, or duplicate targeting registries.
- **Visual/feel target:** An optional quick-reference, not another permanent HUD and not a claim of visual truth unsupported by observed play.
- **Acceptance:** F4 + optional LB/RB hold opens/closes; Region is never invented; Silt habitat/pressure/ledger reflect active frame; 3/6/12 Core phase is real, geology correspondence is clearly labeled unimplemented; no route/input state changes; other regions render safe basic inspector.
- **Regression:** LS1B/LS1A/LS1A2, HXP2A1, B2B1.1/B2/B3/B3.1, undefined-method audit.
- **Status:** Automated inspection passed; browser visual and controller behavior awaiting user validation. Expand canonical per-region explanation in later LS1C passes without adding new overlay classes.
