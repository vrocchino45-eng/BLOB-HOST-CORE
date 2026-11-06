# BLOB GSL-4E1B — Behavioral Choreography (isolated delta)

## Installation
Extract all four files beside your existing GSL4E1A files in the BLOB-HOST-CORE repository root. This ZIP includes the unchanged GSL4E1A controller dependency to avoid a missing-import error.

## Run
`node .\GSL4E1B_tests.mjs`
`python -m http.server 8765`
Open http://localhost:8765/GSL4E1B_PREVIEW.html

## Scope
- New choreography controller selects phases and target offsets; GSL4E1A remains the behavior/priority owner.
- The preview keeps provisional GSL4C-style damped movement; no gameplay runtime integration.
- No changes to LS1 physics, Core contact/release, or audio.
- Visual attention ray is debug-only; not final Guide artwork.

## Watch for
Curiosity notice/orient/anticipate/approach; support approach/settle; concern interrupt/recoil/hesitate/return; intentional release without concern. Report any snapping, boundary violations, or ambiguous motion.

## Limitations
This is a synthetic preview with fixed Core and Host signal. Tests check phase transitions and target bounds, not perceptual readability or live gameplay. Choreography is intentionally provisional for co-development.
