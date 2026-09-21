# HC-015F Build Report — Player Perception / Visual Hierarchy

## Mode
Convergence / player perception. No new ecology, chemistry, entities, gates, routes, or progression.

## Evidence basis
The full HC-015E gameplay recording showed that runtime systems were often functioning while player-facing causality remained difficult to read. HC-015F therefore treats player perception as the defect: active gameplay objects must dominate passive presentation, and Guide text must confirm rather than explain the whole solution.

## Changes
- Signal Plain now publishes an explicit perception hierarchy: Core -> current receptor/receptive center -> organ -> passive field -> macro context.
- Nearest unread receptor receives stronger emissive/opacity/proximity response.
- Dormant and already-read receptors are visually subordinated while retaining state.
- Route-marker rings are reduced substantially; they reinforce the organ rather than function as waypoint UI.
- Receptive-center invitation is stronger only after 3/3 reads.
- Aperture presentation tissue softens more aggressively inside the active ecology pocket.
- Guide sightline is reduced further.
- Signal Plain inspection focus uses tighter blocker suppression while preserving existing camera ownership.
- Guide copy is shortened to state confirmation: active receptor / center / Pulse, rather than narrating the complete procedure.
- Existing 3 reads -> Stabilize -> READY -> fresh Pulse state machine is unchanged.

## Locked systems
Movement, Comb/Aperture progression, debug jumps, camera-transform ownership, ecology completion rules, gate truth, chemistry, entities.

## Validation
PASS: `validatePlayerPerceptionHC015F.mjs`
PASS: undefined-this-method audit
PASS: Node syntax checks for edited JS files
NOT RUN: dependency-based runtime validators / Vite production build because the uploaded HC-015E source package contains no installed `node_modules` and this environment has no network dependency install for the package. Run `npm install`, then `npm run validate:current` and `npm run build` locally.

## Playtest acceptance
Use Ctrl+Shift+8 first, then a normal run. With debug text ignored/hidden, the current receptor should be the strongest world-space gameplay read; passive anatomy should recede; after 3/3, attention should transfer to the receptive center. The Guide should no longer be necessary to understand the entire sequence.
