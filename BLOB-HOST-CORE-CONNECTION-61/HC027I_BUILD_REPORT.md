# HC027I Build Report — Embodied Verb Affordance

## Purpose
Deepen HC027H's non-prescriptive choice field so the existing Signal Plain conditions suggest plausible Core experiments through their physical behavior, without button prompts, lock-and-key requirements, rewards, or persistent consequences.

## Pilot
**Signal Plain / Shift+8** remains the single pilot space.

## Three embodied conditions
1. **Slow breath → draw/release**
   - existing filaments repeatedly draw inward and relax
   - holding Absorb nearby temporarily deepens the draw and organizes the local receptor
   - no read/completion/progression flag is set by the response

2. **Paired chirp → call/wait**
   - existing receptor emits a paired visual chirp followed by a quiet gap
   - a nearby Pulse creates a short answer flare
   - the Pulse remains the same HC027D sonar verb and range

3. **Shear drift → phase slip**
   - existing layers visibly slide out of alignment
   - holding Stabilize nearby suppresses the shear and makes the receptor locally coherent
   - coherence fades when the action ends; HC027J still owns future persistence

## Player-facing language
Guide text may describe the physical condition when the player approaches closely, but never names Absorb, Pulse, Stabilize, RT, X, or LT as the required answer.

## Authority boundaries
HC027I does not:
- mark receptors observed from a matching verb
- complete Signal Plain from a matching verb
- penalize a wrong verb
- create waypoints/objectives/rewards
- persist a changed state
- alter routes/progression
- alter verb ranges
- add geometry or source modules

## Scope proof
Active-source changes relative to HC027H are limited to:
- `src/fields/SignalPlainEcologySystem.js`
- `src/guide/GuidePromptSystem.js`
- `src/ui/PlaytestHudSystem.js` (debug telemetry only)
- `src/data/RecipeDataSystem.js` successor status allowlist
- `src/main.js` build identity

Locked owners verified byte-for-byte unchanged:
- `EventAnchoredHostAudioSystem.js`
- `CoreSensoryResponseSystem.js`
- `AmbientMaterialInteractionSystem.js`

## Validation
- HC027I focused validator PASS
- full HC027I → HC023A current regression chain PASS
- RecipeDataSystem PASS
- undefined-method audit PASS
- 92 active JS modules syntax PASS
- 322 public JSON files parse PASS

## Environment limitation
The handoff still has no local `node_modules`, so Vite/Three.js runtime bundling is not certified in this environment. Browser playtest remains the authoritative feel check.
