# BOT1-C — Watcher Objective / Target-Owner Attribution Pass Box

**Mode:** Diagnostic / evidence instrumentation, then constrained real-player browser test.  
**Purpose:** Trace `HUD directive -> input dispatch -> attempted target -> owner eligibility -> target reaction -> Watcher acknowledgement -> HUD result`.

## Allowed scope

- Prefer read-only exposure of the Watcher/objective owner result to recorder with existing engine state, if already available.
- Instrument a *specific*, non-forging, owner-authored `Pulse attempted / eligible / accepted / rejected (reason)` record. Include referenced target and sampled target motion when available; never claim unobservable fields.
- Correlate input event ordinal with owner outcome via explicit ID; never infer causality solely by timestamps.
- Bot may use real keyboard/mouse input and visible HUD/screen, but cannot teleport, write hidden target IDs, or mutate owners.
- Include separate tests for (1) standing still and pulsing, (2) intentional target inspection/aim followed by Pulse, (3) Absorb-only control, and (4) no-input baseline.

## Forbidden scope

- No changes to the three player verbs, mechanics, ability thresholds, physics, targeting eligibility, Host receipts, material ownership, world layout, or Core 3/6/12 behavior.
- No fabricated Watcher success, automatic target lock, or hard-coded progress.

## Acceptance criteria

1. Six or more normal world-view Pulse attempts logged with canonical input IDs.
2. Each attempted Pulse either produces a target-owner result with a reason or is clearly marked not observed / recorder gap.
3. A real Watcher acknowledgement is confirmed **only** by its owner stage/receipt (not the HUD phrase or raw Pulse).
4. Screenshots + owner evidence distinguish: no visible target, visible but out of range, aimed at ineligible object, aimed at eligible object but mistimed, and accepted reaction.
5. Evidence report names the blocked dependency before proposing gameplay code changes.
6. No difference in current Host receipts or progression authority in control scenarios.

## Locked regression

- Canonical REC1 full-capture retention; C0E1/C0E2/C0E2-B/C0E3 regional systems; authoritative Silt-to-Vascular receipt chain; existing input mappings and manual 3/6/12 selection.

## Test outcome classification

- **INPUT_FAILURE:** No canonical action event.
- **TARGETING_UNKNOWN:** Input exists, no target-owner result.
- **TARGET_REJECTED:** Owner explicitly rejects with cause.
- **OWNER_ACKNOWLEDGED:** Owner confirms valid Watcher read.
- **HUD_MISMATCH:** Owner acknowledges but HUD still gives old objective.
- **UNDETERMINED:** Missing instrumentation / incomplete sample.
