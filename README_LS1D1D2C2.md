# LS1D1D2C2 — Pulse / Absorb visual destination preview

Apply over LS1D1D2C1. Changed file: src/player/CoreVerbPhysicalizationSystem.js.

- Committed held Silt position directs the Pulse visual charge orientation and focused front orientation. Existing Pulse sonar contact and collision authority are unchanged.
- While Absorb is held and there is no existing ChemObject bond target, a faint line/funnel/filament preview points to held Silt material. No absorb motes, progress, transfer, or ledger updates are authorized by this preview.
- Legacy bond Absorb and normal Pulse behavior remain when no committed Silt visual target exists.
- frameState.verbVisualTargetAuthority reports visual route and explicitly says gameplayAuthorityChanged:false.

Test: hold A grip on Silt grain; turn camera away; Pulse charge should orient toward held grain; hold Absorb to see faint connection but no consumption. Release grip and verify legacy behavior. Test old ChemObject absorption independently.

No browser runtime test has been performed.
