# HC-004R Acceptance Tests

## Build identity

- [x] Manifest reports HC-004R.
- [x] Package and lockfile report 0.0.74.
- [x] Runtime entry reports HC-004R.

## Lock trigger

- [x] Grave route lock remains inactive before post-seam completion.
- [x] Lock requires the Grave bed active cell.
- [x] Lock requires `completed` and `responseComplete`.
- [x] Lock requires stage `grave_bed_post_seam_response_complete`.
- [x] Lock latches completion history once verified.

## Completion ownership

- [x] `GraveRouteLockSystem` becomes the active full-debug owner after completion.
- [x] Progress reports 100%.
- [x] Ready and complete report true.
- [x] No expected target is required.
- [x] No input is required.
- [x] No blocker is reported.

## Player-facing completion

- [x] Guide reports that the Grave has answered.
- [x] HUD reports `Grave Memory Route: complete / locked`.
- [x] Tissue readout reports `Grave memory route: complete and locked.`
- [x] Player-facing text no longer includes an HC build ID.

## Forbidden regression checks

- [x] No runtime exit activates.
- [x] No player relocation occurs.
- [x] No new morph activates.
- [x] No new route branch activates.
- [x] No gate, door, or teleport is added.
- [x] Protected remains stay intact.
- [x] Inheritance seed stays closed.

## Automated verification

- [x] 34/34 validation scripts passed.
- [x] Undefined-method audit passed.
- [x] Production build passed.
- [x] Vite development server returned HTTP 200.
