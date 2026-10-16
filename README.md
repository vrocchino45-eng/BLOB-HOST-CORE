# LS1D1D2E input-edge capture correction

Apply over the LS1D1D2E Observation Capture build (it replaces only `src/debug/WorldObjectCensusSystem.js`).

Alt+Shift+R starts/stops; Alt+Shift+E exports. F4/F5 unchanged.

New events: keyboard-down/up, gamepad-button-edge (raw button indices), gamepad-axes (coarsely quantized), observed-state-change. Each input event includes the current Silt material target snapshot. No gameplay routing is changed.

Caveats: 150ms polling may miss quick gamepad taps. Input events prove inputs, not that Pulse or Absorb changed material. Controller button indices are raw, not inferred verb names. Test in browser; syntax check alone is not a gameplay test.
