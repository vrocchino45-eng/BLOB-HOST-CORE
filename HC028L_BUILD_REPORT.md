# HC028L Build Report — Reciprocal Ecological Behavior

## Intent
Carry HC028K's short-lived entity memory into the organism's **next bounded behavior** so relationship has continuity beyond posture: the bonded Tender may choose closer care, guarded distance or a settled follow relationship; the anchored Watcher may hold a sample, counter-scan, guard its anchor or settle into observation.

## Parent
- **Parent:** HC-028K — Reciprocal Ecological Memory
- **Build:** HC-028L — Reciprocal Ecological Behavior
- **Version:** 0.28.20
- **Telemetry:** `blob.session.telemetry.v1.12`

## Architecture audit
HC028K already provides temporary organism-specific memory and HC028J already owns relationship interpretation. HC028L does **not** replace either system and does not create a second creature-AI owner.

New `EntityReciprocalBehaviorSystem` is a directive bridge only. It translates retained memory into a bounded behavioral intent. The existing `EntitySystem` remains the sole owner that actually positions/steers the Tender and Watcher.

Causal chain:

`P/A/S relationship → organism interpretation → short-lived memory → bounded next-behavior directive → existing EntitySystem`

## Tender behavior
HC028L changes actual spacing only for the already-bonded Tender while it is functioning as a companion outside the nursery. Nursery objective geometry and unbonded Tender placement remain authored by the existing system.

Examples:
- `care_exchange_retained`, `reciprocity_retained`, whole-Core attunement → **approach_care**
- guarded/cautious/testing memory → **guarded_space**
- settled/steady memory → **settle_nearby**
- remembered signal/display → **attentive_follow**

The spacing offsets are restrained. The largest authored displacement bias is approximately 0.42 world units before decay/repair suppression. If actual Core strain requires care, the reciprocal spacing effect is reduced so the existing repair-attendance behavior remains dominant.

### Explicitly unchanged Tender physiology
- bond thresholds and safe-care proof,
- passive scar-repair rate (`0.0012/s`),
- Pulse-boosted repair rate contribution (`0.0042/s`),
- navigation/route guidance authority (still Guide Orbiter),
- repair boost trigger and duration.

## Watcher behavior
The Watcher remains physically anchored to its authored nursery position. Retained relationship memory changes **attention**, not location:
- sample/probe/stable-signal memory → **hold_sample**
- counter/full-spectrum memory → **counter_scan**
- defensive memory → **guarded_anchor**
- observation memory → **settled_watch**

These modes change tracking persistence / scan motion and existing state labels. They do not make the Watcher a guide, enemy, turret or progression sensor.

## No affinity or hidden score
HC028L still has no relationship XP, favorability points, faction score, dialogue flags or timing success window. The behavior disappears as HC028K memory decays.

## Explicitly unchanged
- HC028J relationship meanings.
- HC028K memory duration/commit behavior.
- Tender bond/repair rules.
- Watcher position and nursery ownership.
- player movement and topology handling.
- Pulse / Absorb / Stabilize strength, range, targeting and cost.
- regional composition and Host clock.
- route completion / Hub commit.
- HC028I1 Comb re-entry + return arming.
- chemistry, Core Work, 3→6→12 and progression.

## Telemetry
Schema advances to **v1.12**.

New event:
- `ecology.entity_reciprocal_behavior.changed`

It records which organism changed next-behavior mode and the retained-memory strength. Developer truth explicitly states no player-movement, affinity, bond, repair, combat, progression or route authority.

## Runtime diff from HC028K
Changed/new runtime JS only:
1. `src/ecology/EntityReciprocalBehaviorSystem.js` — new directive bridge.
2. `src/ecology/EntitySystem.js` — bounded Tender companion spacing + Watcher attention consumption.
3. `src/core/GameRuntime.js` — system construction/registration.
4. `src/core/SessionTelemetrySystem.js` — v1.12 behavior event.
5. `src/main.js` — build identity.

**101 other HC028K runtime owners are byte-identical.**

## Validation
- HC028L reciprocal-behavior contract: PASS.
- Direct mapping proof: Tender care memory → `approach_care`; guarded memory → `guarded_space`; Watcher sample → `hold_sample`; counter memory → `counter_scan`.
- **106/106 runtime JS**: `node --check` PASS.
- **401/401 public JSON**: parse PASS.
- RecipeDataSystem load: PASS.
- undefined `this.method()` audit: PASS.
- **101 parent runtime owners**: SHA-256 lock PASS.
- HC028I1 Comb boundary owner remains among locked files.

## Render limitation
This handoff still does not include local `node_modules`, so Vite/browser rendering was not executed here. Live controller playtest remains the authority for whether the spacing and attention shifts are perceptible without looking mechanical or over-scripted.
