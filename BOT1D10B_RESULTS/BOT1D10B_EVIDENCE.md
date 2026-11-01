# BOT1-D10B — Golden / Guided repeatability gate

**Gate:** `ASSISTED_REPEATABILITY_SMOKE_PASSED`
**Stage 5:** 6/6 expected attempts
**Recording completeness:** 6/6 expected attempts

| Round | Run order | Profile | Owner invitation | Stage 1 | Stage 5 | Diagnosis |
|---|---:|---|---|---|---|---|
| 1 | 1 | golden | yes | yes | yes | OWNER_CERTIFIED_STAGE5 |
| 1 | 2 | guided | yes | yes | yes | OWNER_CERTIFIED_STAGE5 |
| 2 | 1 | guided | yes | yes | yes | OWNER_CERTIFIED_STAGE5 |
| 2 | 2 | golden | yes | yes | yes | OWNER_CERTIFIED_STAGE5 |
| 3 | 1 | golden | yes | yes | yes | OWNER_CERTIFIED_STAGE5 |
| 3 | 2 | guided | yes | yes | yes | OWNER_CERTIFIED_STAGE5 |

**Golden:** 3/3 Stage 5; 3/3 invitations; 3/3 complete REC1 captures.

**Guided:** 3/3 Stage 5; 3/3 invitations; 3/3 complete REC1 captures.

## Evidence boundaries
- Live bots use the D10A public-HUD/input policies without modifying their source or game behavior.
- Owner invitation, ordered Fold stages, Q/Stabilize start/end, and Host categories are checked only after REC1 export.
- Alternating bot order mitigates a fixed order effect but does **not** control random Watcher packet position or world RNG.
- BOT policy labels are not game-world seeds.
- Stage 5 is not a Host receipt; full Core–Host–Guide causality remains unverified.
- A passing 3-round smoke gate is not evidence of guaranteed or statistically established reliability.
