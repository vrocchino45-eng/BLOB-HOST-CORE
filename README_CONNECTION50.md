# CONNECTION50 — live Grave recovery feedback

Install over CONNECTION49. Extract into your project root with CONNECTION50_PATCH intact:

```powershell
node .\APPLY_CONNECTION50.mjs --check
node .\APPLY_CONNECTION50.mjs
```

Reload. Exact originals remain in CONNECTION50_BACKUP. Restore with `node .\APPLY_CONNECTION50.mjs --restore`; unknown later edits are protected.

With F4 / the existing label toggle enabled, the Core card now explains the current Grave memory response. Detailed notes use the same read-only data.

| Situation | Label meaning |
|---|---|
| Actual earned assistance contributes this update | Rebinding now |
| Residue has not been read | Pulse to read first |
| Read residue has not been stabilized | Settle it with Stabilize first |
| Player is outside the existing range | Move near the residue |
| Trace is intact | Memory retained; no recovery needed |
| Disturbed trace is eligible but hold is released | Memory available; hold Stabilize to rebind |
| Inspection or Core Work | Core memory assist paused |
| Authenticated Host memory already supplies the full rate | Shared ceiling; earned memory adds no extra rate |

Availability alone never produces the active wording. GraveMemoryRouteSystem records the frame of an actual contributing recovery tick, then publishes a read-only reason and current frame. The label reader requires the actual earned growth state and a current, mounted Grave owner witness. It suppresses stale, off-route, unknown, unowned or unearned action estimates. The enabled card keeps its existing 0.2-second refresh cadence.

The underlying CONNECTION48 recovery rates, eligibility, ceiling, suspension and damage/transfer rules are unchanged. This adds no automatic repair, bonus, receipt, material, progression, sound, geometry or control. Existing palette, background, camera and Surface-first growth remain intact.

| Pass field | Boundary |
|---|---|
| Mode | Feedback convergence |
| Purpose | Explain when earned Grave memory is helping an actual world interaction |
| Allowed scope | Read-only contribution witness/reasons, Core label rows and bot coverage |
| Locked systems | Recovery math and eligibility, Host channel, safe transfer, damage, route/phase progression, input, camera, audio, palette and background |
| Delete / disable targets | No runtime systems removed |
| Visual / feel target | Distinguish active work, available memory and a blocked/paused action with labels enabled |
| Acceptance | Current-frame evidence for active wording; useful waiting reasons; no stale/off-route claims |
| Regression | Existing measured recovery, actual earned Grave return, label controls, inspection/held exits, installer and build |

AC01 adds six groups covering owner reasons, actual contribution stamping, malformed/stale witness rejection and read-only labels. AB03 retains the full actual Surface and Grave transfer/return sequence and adds two enabled-label groups for active hold, released availability and inspection pause. Grave entry/revisit navigation, near-object poses, Guide path trajectories and deterministic time remain declared fixtures; no earned history or completion flags are injected by AB03. T02 and S05 retain their existing declared fixture scopes.

The initial browser assertion sampled a released label after two simulation ticks, before its existing 0.2-second UI refresh. The test now allows fifteen ticks after release and inspection. No production refresh or recovery behavior was changed for that correction; the initial failure is retained in evidence.

Catalog: 37 quick cases / 604 checks; 27 browser case IDs; 64 total IDs. Focused browser selection: AB03 (16 groups), T02 normal (19), S05 trial (7), totaling 42 groups in three runs. Other 24 browser case IDs are not rerun. Human readability and feel acceptance remain open.

```powershell
node .\BLOB_BOT_SERIES1\run.mjs --quick
node .\BLOB_BOT_SERIES1\run.mjs --case=AB03
```
