# HC028B1 Focused Playtest — Transition Resolution + Convergence Reachability

## Scope
Test only Vascular return, Silt return, and post-route Hub convergence reachability. Do not evaluate the later verb-chording redesign in this build.

## Test A — Vascular return
1. Complete Vascular normally.
2. When the current turns gold, stop searching for A/E.
3. Follow the return current into the visible entry fold.
4. PASS: crossing begins by entering the fold.

## Test B — Silt return
1. Complete Silt normally.
2. Follow the released amber breath to the entry fold.
3. PASS: crossing begins by entering the fold without A/E.

## Test C — Hub center after three routes
1. Return from all three routes.
2. Enter the convergence weave and circle as before.
3. Spiral inward deliberately.
4. PASS: retained Silt membrane chemistry may still exist visually/chemically, but `playerAttachment.active` must be false while convergence is available and incomplete.
5. PASS: reach <= 1.25 units from the convergence center using movement alone. Stabilize may help feel, but must not be required.
6. FAIL: Core settles into an involuntary ~3.6–3.9 orbit while inward input is held.

## Telemetry checks
Expected new events: `route.resolved`, `route.release.started`, `transition.available`, `transition.entered`.
`movement.progress_blocked` should remain at 0 during a clean convergence attempt.
Movement samples now include desired input acceleration, environmental flow acceleration, final move vector, convergence envelope strength, and attachment state.
