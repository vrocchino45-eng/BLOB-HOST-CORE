# HC-005C Acceptance Tests

## Signal Chorus return ownership

- [x] `SignalChorusReturnStateSystem` remains the active post-return owner.
- [x] Stage remains `signal_chorus_return_state_held`.
- [x] Active cell remains `CELL_SIGNAL_CHORUS_NERVE_001`.
- [x] Expected and actual targets remain `none`.
- [x] Old Signal Chorus tuning loop remains suppressed.
- [x] Grave route remains closed and complete.

## Readability

- [x] Authored opacity is preserved as the source for return-state visibility scaling.
- [x] `signal_chorus_soft_haze_001` is not assigned opacity `1`.
- [x] Haze opacity is capped at `0.022`.
- [x] Haze is compacted and offset from the camera/play pocket.
- [x] Signal surface and tissue arcs remain visible.
- [x] Resonance node remains visual-only and cannot steal targeting.
- [x] F1 can report readability lock and haze opacity inside the screenshot budget.

## Camera-relative movement

- [x] Default camera: left-stick up follows camera-forward on XZ.
- [x] Camera yaw rotated 90 degrees: left-stick up rotates with camera-forward.
- [x] Left-stick right follows camera-right.
- [x] Camera pitch does not inject vertical movement into the planar vector.
- [x] Trigger/shoulder vertical movement remains world Y.
- [x] Runtime publishes `movementReference: camera_relative_planar`.

## Scope control

- [x] No new route or morph activates.
- [x] No gate, door, teleport, stage loader, or branch menu is restored.
- [x] No Signal Chorus puzzle is added.
- [x] No changes reopen the protected Grave objects.
- [x] HC-005A return-path geometry and completion logic remain unchanged.

## Automated verification

- [x] 38/38 validation and audit scripts pass.
- [x] Undefined-method audit passes.
- [x] Production build passes.
- [x] Vite development smoke test returns HTTP 200.
- [ ] Live controller/readability screenshot accepted by the user.
