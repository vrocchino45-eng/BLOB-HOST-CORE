# HC-005C — Signal Chorus Return Readability and Camera-Relative Movement

## Pass mode

Feel Mode

## Purpose

Make the verified Signal Chorus return state visually readable and make planar movement remain intuitive after the player rotates the camera.

## Problem A — opaque return haze

The Signal Chorus environment authored `signal_chorus_soft_haze_001` at low opacity. HC-005B’s visibility enforcement recursively set Signal environment materials to opacity `1`, turning the haze mesh into a pale full-screen volume.

## Repair A

`SignalChorusReturnStateSystem` now applies opacity factors from each material’s recorded authored opacity.

- Soft haze factor: `0.42`
- Soft haze cap: `0.022`
- Surface factor: `0.82`
- Other Signal environment factor: `0.90`
- Haze scale: `[0.94, 0.46, 0.72]`
- Haze offset: `[0.00, 0.34, -1.15]`

The system also updates the readability baseline consumed by camera visibility support, preventing a later system from ramping the haze back toward opacity `1`.

## Problem B — movement meaning changed after camera orbit

The input system produced world-axis movement. The player controller directly applied those axes, while the camera orbited independently. After yawing the camera, pushing the stick upward no longer meant moving forward in the viewed direction.

## Repair B

`PlayerMovementController` now constructs a camera-relative planar basis each frame:

```text
camera forward → project onto XZ → normalize
camera right   → planar forward × world up
left-stick up  → planar camera forward
left-stick right → planar camera right
vertical input → world Y
```

Camera pitch is intentionally excluded from planar travel. This keeps movement level even when the camera looks above or below the core.

## Visual target

- Dark living-nerve pocket remains visible around the returned Chorus.
- Player core is readable immediately.
- Surface bands and middle-distance arcs retain separation.
- Haze supports depth without obscuring the play pocket.
- Resonance node acts as a compositional anchor without becoming an interaction target.

## Feel target

- Right-stick orbit changes viewpoint without scrambling the movement scheme.
- Left-stick up consistently means forward relative to the current camera heading.
- Left-stick right consistently means screen/camera right.
- Vertical control remains deliberate and separate.

## Ownership retained

```text
SignalChorusReturnStateSystem
stage: signal_chorus_return_state_held
active cell: CELL_SIGNAL_CHORUS_NERVE_001
target required: false
```

No downstream route owner is introduced in this pass.
