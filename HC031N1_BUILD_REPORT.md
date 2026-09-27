# HC-031N1 — Physical-Language Causal Continuity

Parent: **HC-031N — First Physical-Language Validation**

Mode: **convergence / validation-lens repair**

## Purpose

Repair the HC031N observer using evidence from the first N playtest without changing gameplay.

The N session proved that existing Host/community systems are active, but the probe abandoned a valid chain when aim ownership released before a later deliberate peel. It could also count pre-existing Host-contact state as a `world_answer`. N1 fixes those observer errors before any gameplay, route, or progression changes are considered.

## Causal chain

`noticed → owned → contact → surface_travel → verb_applied → world_answer → deliberate_release → reacquired_contact → reinteracted`

N1 changes how the observer follows that chain:

- a chain arms only when an aim-owned noun overlaps **live Host contact**;
- aim ownership must remain coherent through `verb_applied`;
- after the verb is committed, natural aim release does **not** erase the causal history;
- `world_answer` requires a real state change relative to the pre-verb frame;
- `surface_brace` or an already-active response mode cannot validate the premise by itself;
- a deliberate peel can advance the same chain after attention has released;
- re-entry plus a new verb relationship completes the chain.

## Host-anatomy identity hierarchy

N1 adds read-only semantic identity above collision/support IDs:

`micro support → anatomy unit → Host instrument`

For the current shared first slice, neighboring authored supports can resolve to stable units such as:

- `membrane_causeway`
- `scar_buttress`
- `residue_wash`

All belong to the read-only parent instrument identity:

`host_contact_shared_first_slice`

A new telemetry event, `validation.host_anatomy.identity_changed`, records whether a micro support transfer remained inside the same anatomy unit and/or Host instrument. This changes no attachment law or collision authority.

## Post-verb answer rule

N1 snapshots target / Host / community evidence from the frame before `verb_applied`. A world answer is recognized only when evidence changes afterward.

Possible answer evidence includes:

- chosen-target reactive state, focused Pulse, Absorb progress, or Stabilize progress;
- Host visual/contact grammar, local imprint, or surface-braced projection state changing;
- community relationship interpretation, retained memory, reciprocal behavior, or local Host matter changing.

This is observer logic only.

## Identity / telemetry

- Build: `HC-031N1`
- Label: `Physical-Language Causal Continuity`
- Package: `0.31.31`
- Telemetry: `blob.session.telemetry.v1.35`
- `implementationPass` now reports `HC-031N1` instead of inheriting the older TargetingSystem pass.

## Locked systems

17 gameplay owners are SHA-256 locked unchanged from HC031N, including movement, attachment, targeting, verbs, chemistry, Host contact response, ecology, camera, input, and runtime order.

N1 does **not** add:

- movement tuning
- stronger/weaker adhesion
- target-selection changes
- verb tuning
- Host amplifier mechanics
- haptics
- route unlocks
- a next-region transition

The lack of onward-region progression seen in the N playtest is therefore intentionally not repaired in N1. That should be addressed only after this validation lens gives us one trustworthy complete physical-language chain.

## Validation

`npm run validate:current` must prove:

- free-space attention ownership alone does not arm a chain;
- live contact does arm it;
- micro support transfers retain stable Host-anatomy identity;
- unchanged pre-existing Host state does not count as `world_answer`;
- a post-verb Host/community state change does count;
- attention release after `world_answer` does not abandon the chain;
- deliberate peel, re-entry, and reinteraction complete the chain;
- all 17 gameplay-owner hashes remain unchanged.
