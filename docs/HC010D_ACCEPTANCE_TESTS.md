# HC-010D Acceptance Tests

## Automated

1. Reproduce Hub Grave entry at `[0.12, 0.2, -4.4]`.
2. Prove the first husk lies beyond the old world-origin ellipsoid.
3. Mount Grave without changing player position.
4. Confirm the new boundary center equals the preserved entry position.
5. Confirm collision owner is `PlayerMovementController` and tuning owner is `GraveMemoryRouteSystem`.
6. Approach all four Grave objects using normal camera-relative movement.
7. Confirm each object enters its unchanged Pulse range and receives a Pulse read.
8. Reject teleport-sized movement steps.
9. Unmount Grave and confirm the shared origin-centered boundary is restored.
10. Preserve Grave budget `7`, first-slice budgets `15 → 13 → 8`, and 20 dormant compatibility systems.

Run:

```bash
npm run validate:grave-approach-boundary
```

## Live

1. Enter Grave through the active Hub body with F1 hidden.
2. Push toward the old Core husk; the Core must pass the former invisible stop point.
3. Approach and Pulse husk, silt, scar, and inheritance seed normally.
4. Complete the existing unsafe Absorb, Stabilize recovery, and safe-transfer circuit.
5. Return through the fold and confirm Hub movement remains normal.
6. Open F1 only afterward and verify the Grave boundary is region-local and Player-owned.
