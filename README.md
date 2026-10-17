# BLOB: HOST CORE — LS1D1D2M Contact/Pulse Arbitration

## Install

**Changed-files overlay, NOT a standalone game. Apply over LS1D1D2L.** In the existing BLOB project, overwrite only these three paths:

- `src/contact/SiltCompressionContact.js`
- `src/routes/SiltPressureRouteSystem.js`
- `src/debug/WorldObjectCensusSystem.js`

Do not replace the rest of the project, delete old HC/LS1 indexed history, or add the deferred experimental D2E authority guard.

## Convergence purpose

The D2L observation confirmed **27 braces, 5 loaded presses, and the first reversible imprint**, but also 27 brace releases: **11 due to the original tether range, 9 due to a separate 0.85 Core-drift cap, 6 grip releases, 1 Absorb withdrawal**. The player identified the remaining control contradiction: Pulse can move an already-touching grain off the patch instead of pressing into the plate. This pass addresses that contradiction without redefining free-grain Pulse.

## Changes

1. **Contact-before-Pulse arbitration.** If the *already committed* grain is physically touching the one existing Silt garden patch, LT is held, Absorb is not held, and the normal brace cooldown/range rules are met, the route engages the brace **before** applying X/Pulse movement that frame. The Pulse is then routed through the actual contact and registers `stabilized-contact-resistance` with **zero grain displacement**. This is not auto-targeting or a remote snap. If the grain is outside the patch, Pulse still moves it normally, and the player must first establish legitimate contact.
2. **One hard leash, visible warning.** The existing Silt grip remains **max 1.6 units**; the stable brace remains capped at **1.58**, with unchanged **0.38** inward movement radius. The former **0.85 Core displacement-from-brace-entry** rule no longer silently breaks the brace; beyond it the tether and plate show amber/orange *strain* warning, while the real 1.58 limit still releases it. A genuinely stretched/grip-released/Absorb-withdrawn connection breaks as before. No infinite leash or Core constraint.
3. **More visible authored deformation.** Pressure contracts and lowers the existing patch; a single cosmetic inner depression contour appears as pressure builds (amber) and becomes pale gold on imprint. Strain cue is warmer orange, separate from turquoise contact and pale-gold imprint. The contour is `targetingSuppressed`, non-collidable, and provides no additional region interaction.
4. **Recorder clarity.** Published contact state and JSON now include `braceTension` (0–1) and `braceDriftWarning` (boolean). Export is `BLOB_LS1D1D2M_OBSERVATION.json`; original owner, motion, contact, progression, and census fields stay available. Historical HC/LS1 history remains indexed.

## Mechanics explicitly locked

D2I unbraced movement **Pulse +0.28** per accepted tap and **Absorb 0.72/s**, min/max grip radii **0.38/1.6**; LT+A acquisition; A/LT release; pressure gain **0.42/Pulse**, imprint threshold **0.80**, release/recovery behavior; eight stable Silt grain identities; lifecycle/mass conserved; original environmental porous nutrient and Silt route progression; Hub/Surface traversal, Guide and ecology, external verb routing, camera aim. No new mechanics beyond the one localized contact arbitration or reward changes.

**Authority limits:** One authored patch with proximity/held-grain state—not full rigid-body collisions, physics impulses, chemistry, fracture, bonding, Core intake, material consumption, or persistent terrain deformation. No contact-generated progression credit.

## Manual acceptance — 2–3 minutes

1. Apply the ZIP over D2L and enter the Silt garden. Start capture via **Alt+Shift+R**.
2. Aim at a valid grain, hold LT + A to grip, and bring the grain against the sediment patch. Look for turquoise contact/brace feedback.
3. Without changing the Core position, tap X twice. **The ball should stay on the plate** while the plate visibly depresses and an imprint appears. The first Pulse must not throw it out of alignment.
4. Move the Core a little farther while still holding LT. The brace should remain if the grain remains within the original tether. The tether turns orange near strain; moving beyond its maximum breaks the brace.
5. Hold RT to withdraw. The brace and imprint relax. Release/reacquire; use Pulse on a **free grain away from the plate** to verify the old push still works.
6. Stop recording with **Alt+Shift+R**, export with **Alt+Shift+E**, upload `BLOB_LS1D1D2M_OBSERVATION.json` and report whether contact now feels intentional.

## Validation and limitations

**107 current D2M assertions passed** using genuine `SiltCompressionContact`, the actual route `updateHeldMaterialMotion`, source recorder logic, the real original `SiltGripAuthority` in a Node harness, and stubbed Three.js vectors/materials; including pre-Pulse arbitration, consecutive pressure Pulses, imprint, correct withdrawal/release, free-grain motion, hard tether limit, output telemetry, stronger visuals, unmount identity/lock cleanup. **3/3 changed JS syntax checks passed.** The earlier D2L suite had 204 assertions; its complete harness is not available to rerun in this session and is *not* counted toward D2M's 107. No Vite/browser/WebGL rendered run has been conducted. Real feel and visuals require the above playtest.
