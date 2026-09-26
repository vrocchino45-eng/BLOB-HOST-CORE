# HC-031N — First Physical-Language Validation

Parent: **HC-031M — Targeting / Attention Ownership**

Mode: **convergence / read-only validation**

## Purpose

Validate the already-locked K → K1 → L → M language as one continuous physical chain instead of adding another mechanic.

The active macro lens is now explicit: the player begins as a small Core inside/on an older Core's accumulated **Host Core** anatomy/community. Crawlable Host structure can therefore be read as borrowed functional anatomy — closer to an instrument/body extension than generic level geometry. HC031N does **not** create a new amplifier, ship, haptic, ability, route, or progression mechanic. It only measures whether that meaning already emerges from the current systems.

## Validation chain

`noticed → owned → contact → surface_travel → verb_applied → world_answer → deliberate_release → reacquired_contact → reinteracted`

The probe starts from the HC031M aim-owned noun, then watches HC031K/K1 contact/release, HC031L physical verb grammar, and existing world-response systems.

## World-answer classes

- `chosen_target` — the selected noun physically/chemically answers the verb.
- `host_anatomy` — the contacted Host surface/anatomy shapes or amplifies the gesture through already-existing contact/projection response.
- `community_ecology` — existing organisms/ecology interpret or locally answer the same chord.

This classification is telemetry-only. It grants no gameplay authority and feeds nothing back into simulation.

## Locked systems

17 gameplay owners are SHA-256 locked unchanged, including GameRuntime order, TargetingSystem, PlayerMovementController, VerbCompositionSystem, StabilizedProjectionSystem, ReactiveStateGrammarSystem, Bond/ChemObject, input/control mapping, targeting context, camera, Host-contact ecology, entity relationship/local-matter response, presentation compression, and Core verb physicalization.

## Telemetry

Schema advances to `blob.session.telemetry.v1.34`.

New events:

- `validation.physical_language.chain_started`
- `validation.physical_language.stage_reached`
- `validation.physical_language.world_answer`
- `validation.physical_language.chain_completed`
- `validation.physical_language.chain_abandoned`

Movement samples now include the active validation chain/stage. Summary fields report chain starts/completions/abandonments, best stage, and chosen-target / Host-anatomy / community answer counts.

## Validation

`npm run validate:current` passes:

- HC031N runtime chain proof
- HC031N syntax checks
- recipe data load
- undefined `this.method()` audit
- 17 gameplay-owner hashes unchanged

The production Vite build still cannot run in this Linux container because the uploaded Windows `node_modules` does not contain `@rollup/rollup-linux-x64-gnu`. This is the same environment-specific Rollup optional-binary limitation seen in recent passes; source validation is clean.
