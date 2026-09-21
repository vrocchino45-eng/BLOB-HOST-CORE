# BLOB: HOST CORE — HC016Q

## Mode
R1 ECOLOGY DEEPENING / EXISTING ENTITY PURPOSE.

## Identification
The green multi-lobed creature with three orange sacs is:
`nursery_membrane_tender_001` — Nursery Membrane Tender.

Its visual recipe matches the screenshot exactly:
- mint-green crescent/guarding canopy body;
- cupped seed-guard fronds;
- three orange `tiny_seed_sac` meshes.

It is not the Guide Orbiter. The blue/orange folded lantern remains the Guide.

## Blueprint/data basis
The existing entity recipe already defines the Tender as:
- `cautious_helper`;
- non-absorbable;
- `canBond: true`;
- `canRepairLocalCell: true`;
- protective/repair ecology.

Surface Wake ecological causality already assigns it to the **care** system and says the nursery repairs/remembers departure.

## HC016Q purpose
The Tender can now become a **Care/Repair Companion**.

Bond is earned only when Surface Wake care was successful:
- safe care proof retained;
- Tender trust >= 0.56;
- Tender integrity >= 0.62;
- player is departing/outgrowing the nursery.

If bond is not earned, the Tender remains in Surface Wake.

If bonded:
- Tender follows behind/below/left of the Core so it cannot be confused with the Guide;
- it does not select routes or point toward objectives;
- it senses scar/unsafe absorption strain and moves closer;
- it provides very small passive scar recovery;
- a gentle Pulse while nearby triggers a four-second stronger care response;
- Guide Orbiter remains sole route/navigation interpreter.

## Runtime architecture
EntitySystem is now global but internally scoped:
- Membrane Watcher is visible/updated only in Surface Wake;
- Tender is visible outside Surface Wake only when bonded;
- all other nursery ecology remains local.

This avoids creating another companion system or another runtime registration.

## Acceptance
1. In Surface Wake, Tender behaves as before.
2. Safe care can earn the bond on departure.
3. Without the bond, Tender does not follow later regions.
4. With the bond, Tender follows at rear/side and does not occupy Guide position.
5. High scar/unsafe absorption makes Tender attend the Core.
6. Gentle Pulse near bonded Tender triggers visible `care_response` and stronger recovery.
7. Guide Orbiter remains the orange/blue route-reading object.
