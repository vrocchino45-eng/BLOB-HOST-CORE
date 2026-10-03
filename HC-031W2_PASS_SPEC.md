# BLOB: HOST CORE — HC-031W2 Contact + Targeting Convergence

Status: **scoped / diagnostic handoff, NOT an implemented game build**
Baseline: HC-031W1 telemetry (session `cebca0a7-8099-4267-869e-d45b849f2ba2`)
Mode: Convergence (instrument first; implement only a confirmed, single-owner correction)
Milestone: The Core can deliberately choose one local relationship, establish real authored-surface contact, and leave/reacquire it without hidden changes of authority.

## Purpose
Verify the end-to-end relationship among aim, Stabilize, right-stick steering, physical authored-contact acquisition, release, and reacquisition, without changing the established mapping or ecology.

## W1 evidence — why this pass exists
- 742.987 s wall duration; 4,098 events; 1,428 movement samples.
- Targeting audit: 614 changes; 78 entries classified `stabilize_macro_relationship_suppressed_local_context`; 14 `rs_redirect_candidate_visible`; **0 redirect-evidence-present audits** and **0 successful stabilize-steer redirects**.
- 41 targeting-audit entries had Stabilize held plus right-stick steering. Four had a local candidate; one combined a local candidate inside the logged 5.65 assist range with Stabilize and steering. At t≈668.16 s, the local candidate was `gathering_ground_watcher_001` at distance 0.793, current attention `gathering_ground_relay_b_001`, relationship `none`, right-stick magnitude 0.405; the audit classified macro/local-context suppression and `redirectEvidencePresent=false`. This is a high-value reproduction point, **not yet proof of a redirect algorithm defect**; sustained valid dwell/authority conditions are not established by this one record.
- 77 surface-capability audit changes included 27 transitions labeled mechanically reachable. Across movement snapshots there were **62 mechanically-eligible samples**, including 29 with Stabilize held, 14 with Absorb held (all 14 also Stabilize), and 46 with movement input. Despite this, 0 attachments were logged, and all 1,428 movement samples showed `attachmentState=free`, `authoredSuctionSupportCount=0`.
- Particularly useful surface repro timestamps: membrane_stable t≈419.70–420.22 s (distance 0.400→0.073, Stabilize held), residue_weak t≈602.30 s (distance 0.520, Stabilize+Absorb), membrane_stable t≈666.21–668.31 s (Stabilize+Absorb nearby; steering at ~668.31), scar_brace t≈680.82 s (distance 0.091, Stabilize+Absorb).
- W1 telemetry authority is `read_only_observer`, not a gameplay authority. The capability audit reports reachability, not proof that authoritative locomotion has elected to attach.
- Preserve working progression: 3 ridge reads, 1 ridge completion, 1 adjacent-territory opening and entry, and the Gathering Grounds encounter loop.

## Allowed scope
1. Read-only targeting decision trace at the existing aim/attention/relationship owner.
2. Read-only authored-surface vs authoritative movement-contact decision trace at their existing owners.
3. If confirmed by the above, one narrowly owned correction of local Stabilize+right-stick redirect behavior, and/or one narrowly owned connection of authored contact to existing movement attachment acquisition.
4. Minimal existing visual cues to show selected target / touching / sealed / peeling, only if the state genuinely exists.
5. Run the new telemetry export through `hc031w2_audit.mjs`.

## Forbidden scope
New regions, new verbs, changing A/X or other controller mapping, new global aim assist, altered region bounds, fake attachment counters, fabricated ecology responses, camera rewrite, blanket movement multipliers, chemistry rebalance, audio remaster, new contact-system ownership. No copying code from older BLOB_v4 or BLOB_SANDBOX_V2 into the HC-031W1 runtime.

## Systems locked
HC027D1 calibrated audio, 3→6→12 core derivation, existing verb semantics, world/territory continuity, Gathering Grounds recurrence and memory, pulse/sonar, existing save/telemetry authority separation, controller layout.

## Files/systems to inspect in the actual HC-031W1 tree
Find actual owners via imports before editing; paths are **TBD**, not inferred from an older reference archive:
- Aim candidate selection → attention ownership → relationship-target retention / redirect policy.
- Existing Stabilize + right-stick dwell / assist-range predicate.
- Authored host-contact provider → nearest mechanical eligibility → PlayerMovementController contact/attachment acquisition.
- Tendril/suction seal, support-surface identity, detach, gap tolerance, reacquire guards.
- Telemetry observer interface and export schema (do not grant observer gameplay authority).

## First implementation task: reason-coded proof instrumentation
Emit **state changes and rejected attempts**, not per-frame flood. Targeting trace should have: time, attention/candidate/relationship IDs and scopes, distances, assist range, Stabilize analog value, right-stick vector/magnitude, dwell requirement/age, redirect evaluation yes/no, rejection reason, chosen next local relationship, and whether camera look continued. Show when macro relationship suppression is correctly deliberate.

Contact trace should have: time, authored surface ID/profile/distance/normal, authoritative collision/contact candidate and source, input intent (move, Stabilize, Absorb, Pulse), suction eligibility, seal duration, acquired/rejected with explicit reason, owner surface, attachment state, continuity gap, peel/detach/reacquire reason. Surface capability observation and actual collision ownership must remain distinguishable.

## Delete / disable targets
Do not delete a system based only on zero counters. If duplicate legacy targeting or contact providers are found **inside the current runtime**, document the import owner and quarantine only the conflicting duplicate after proving it is not authoritative. Remove temporary telemetry noise after convergence if it adds no unique decision evidence.

## Visual/feel target
The player sees a discreet difference between aimed candidate, committed local relationship, and surface contact. The Core should appear to make an intentional choice rather than auto-snapping to a distant macro target. Tendrils can touch, seal, pull, peel, and release when—and only when—the existing authoritative movement model says they do.

## Acceptance tests (all required to lock)
- Aim-only: local candidate and attention follow aim; Stabilize does not randomly own a remote macro relationship.
- Local redirect: while a *confirmed valid* local relationship and second local candidate are in assist range, sustained Stabilize + right stick causes ≥1 traceable local redirect after the defined dwell. A failed attempt reports a precise reason. Right stick must still function as normal look when not in redirect conditions.
- Macro guard: far/macro relationship remains excluded from local redirection without breaking remote observation/progression.
- Contact: on a known attachable `membrane_stable` surface, reachability → authoritative contact candidate → suction/attachment acquisition → sustained support appears in logs and visibly. If it fails, show reason and owner rather than calling mere proximity a pass.
- Release/reacquire: an intentional existing peel/release works, clears support, then reacquires when eligible; no permanent lock to prior surface ID.
- Surface profiles: test membrane_stable and scar_brace for intended effects; `residue_weak` can legitimately reject attachment if that is the authored law, but must say why.
- No unexpected controller changes, no blocked free-flight escape, no new invisible boundary, no loss of territory entry or ecology memory.
- Observer remains read-only. No assertion based on an invented event count.

## Regression checks
Start/boost/free flight; pulse quick vs charged; sonar; Absorb without Stabilize; Stabilize without target; Stabilize+Pulse; ridge tracing; continuous arrival in Gathering Grounds; returning exploration; encounter completion/recurrence; controller and mouse input; existing audio reference; export JSON under normal limits.

## Focused test protocol (~8 minutes; existing debug jumps only)
1. Start at an existing reachable membrane contact location; approach/hold Stabilize with small tangential movement; check acquisition and surface identity. Record why if rejected.
2. Add Absorb without changing mapping; check existing suction behavior; deliberately peel/release and reacquire. Repeat once on scar_brace, then on residue_weak to document distinction.
3. In Gathering Grounds: aim at a local relay/watcher, first use aim-only, then establish a local relationship, hold Stabilize and gently steer toward a second local candidate in range for enough time to satisfy defined dwell. Confirm actual redirect or reason-coded rejection.
4. Attempt the same steering on the remote `gathering_ground_cluster` macro target. Confirm suppression without accidental local takeover.
5. Free-fly and repeat ridge/territory/ecology regression, then export one JSON. Manual markers are optional if available; don't invent a hotkey.

## W2 lock gate / next pass
W2 remains **NOT LOCKED** while redirects or attachments remain zero **after valid confirmed opportunities**, or when a failed opportunity has no reason code. Once tested and locked, the following pass can refine tactile visuals/feel, not add more territory.

## Runtime-source gate
The current attachments contain HC-031W1 **telemetry** but not the matching HC-031W1 source archive. BLOB_v4_REFERENCE and BLOB_SANDBOX_V2 are earlier unrelated archives. This handoff therefore does not impersonate a source-level fix. Apply a changed-files-only gameplay patch only against a verified matching HC-031W1 runtime tree.
