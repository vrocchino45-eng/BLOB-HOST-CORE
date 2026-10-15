# LS1D1D2B — Entity Identity Bridge (diagnostic only)

Apply over LS1D1D2A. Only `src/debug/WorldObjectCensusSystem.js` changes.

F4 toggles census, F5 exports JSON. Export while aiming at a Silt grain, then after A commits a grip.

New `entityBridge` section reports Silt candidate/locked/held IDs, legacy object owner families, and unknown verb destinations. Owner classification is explicitly **not** stable entity identity.

No changes to gameplay, progression, targeting, controls, Guide, Pulse, Absorb, or Stabilize.

Acceptance: report includes candidate ID during aim and held ID after A, with legacy target reported independently. Browser validation remains required.
