# HC017A — Core Verb Physicalization Baseline

## Purpose
Give the three existing Core verbs one coherent physical language before adding ambient micro-material.

## Pulse — disturb / excite
The existing Pulse event remains authoritative. HC017A adds a volumetric propagation front and brief contact responses at material already reported as affected. It does not change Pulse range, route logic, or chemistry.

## Absorb — draw / integrate
BondSystem remains the gameplay owner. While the existing metabolic bond progresses, the target now visibly yields toward the Core and a capped stream of small fragments travels from matter to Core. Completion still occurs through the existing absorb threshold/composition logic.

## Stabilize — regulate / bind
Existing `stabilizeHeld` / `resonanceHeld` remains gameplay truth. HC017A gives the held action a sustained regulation field that builds while held and relaxes after release. It uses existing interaction/chemistry proximity as its visual focus; it does not create a new stabilization objective.

## Architectural rule
`CoreVerbPhysicalizationSystem` is presentation-only:
**Core emission → connection/propagation → material contact → visible response**.
Gameplay outcomes remain in ChemObjectSystem, BondSystem, and authored route interaction systems.

## Performance
Absorb fragments are capped at 28 live motes. Pulse/contact effects are short-lived and disposed. No ambient micro-material simulation has been added yet.

## Test
Try Pulse, Absorb and Stabilize repeatedly in Surface/Guide/Hub and on Grave/Vascular/Silt targets.
Judge whether the three actions now look like different physical operations on matter:
- Pulse moves outward and contacts.
- Absorb visibly moves matter inward.
- Stabilize sustains a regulating connection/field.
Confirm existing objectives and chemistry still behave exactly as before.

## Next
HC017B should prove a small representative **material response grammar**—different matter responding differently to the same three verbs—before ambient micro-material is introduced.
