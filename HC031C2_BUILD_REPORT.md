# HC-031C2 Build Report — Fragment Field Capture

**Build ID:** HC-031C2  
**Parent:** HC-031C1  
**Telemetry:** `blob.session.telemetry.v1.26`

## Playtest failure reproduced conceptually
HC031C/HC031C1 proved rupture visuals but not reliable harvest. The previous design forced tiny loose debris through the same retained-target + soft-bond pipeline used for intact ChemObjects. That made the pickup path too indirect for fast fragment clouds.

## Correction
- Intact matter still uses HC029A retained relationships and BondSystem.
- Loose rupture debris now uses a bounded Absorb field owned by `GraveRuptureHarvestSystem`.
- Hold Absorb and aim through nearby debris; at most two eligible fragments are pulled at once.
- Very close debris remains harvestable without pixel-perfect camera aim.
- A fragment is committed as collected when it physically reaches the Core capture radius.
- Missed fragments still cool into persistent Grave residue.
- No new button, health bar, melee attack, route gate, or progression authority.

## Field rules
- influence radius: 5.8
- close aim override: 1.35
- capture radius: 0.52
- max concurrent pulls: 2
- material pull response differs slightly for brittle / silt / echo fragments

## Validation
- HC031C2 end-to-end field-capture numerical smoke: PASS (2.4-unit brittle fragment reaches capture radius in ~0.50s)
- RecipeDataSystem loadAll: PASS
- undefined `this.method()` audit: PASS
- JS syntax: 120/120 PASS
- JSON parse: 462/462 PASS
- parent source files unchanged: 116
- exactly four runtime-source differences from HC031C1 (one new helper + three controlled integrations)

Production Vite render is not claimed because dependencies are not bundled in the package. Browser/controller play remains final feel authority.
