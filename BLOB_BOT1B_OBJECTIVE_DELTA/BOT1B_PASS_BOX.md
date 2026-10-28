# G1-B BOT1 Objective-First Input Pass Box

- **Mode:** Test harness convergence, no gameplay changes.
- **Purpose:** Follow the actual HUD objective before diagnosing game behavior.
- **Locked:** InputSystem, movement, targeting, Pulse/Absorb/Stabilize, Silt chemistry, regional link math, 3/6/12, Host receipts, REC1, HUD code.
- **Allowed:** Update BOT1 reader decision policy; independent calibration; cap attempts; log objective/input/event concordance; screenshots; read-only analysis.
- **Forbidden:** Hidden target/position/ownership reads influencing behavior; teleport; injection; simulated receipts; arbitrary gameplay fixes.

### Acceptance gates

1. **Preflight** passes guarded patch, policy checks, and legacy source-contract validator.
2. **Live browser** on real Vite, not fixture, records separate Pulse/Absorb/Stabilize canonical events.
3. At least one world-view Pulse attempt occurs because the leading HUD objective requests Pulse, with REC1 pulse evidence.
4. Any target success requires its gameplay owner's independent acknowledgement; mere input or HUD text is NOT acceptance.
5. View mode and screenshots reviewed; inability to see a target remains *unproven*, not a collision defect.
6. Neither original game code nor Host receipts are modified; a clean revert is available.

**Next gate after real BOT1-B smoke:** if G1-B input criteria pass, examine target eligibility and visual recognition. If they fail, fix only the bot/dispatch mismatch before touching gameplay.
