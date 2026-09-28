# HC031S + HC031T Combined Delta Apply

## Required parent
`HC-031R — Vascular Relationship Currentization`

Do not apply this combined delta to HC031Q or earlier. It is a direct packaging bridge from the committed HC031R state to the final HC031T state while preserving HC031S.

## Suggested Git branch
`HC031ST-Combined-Silt-And-Open-Territory`

## Apply
Extract `BLOB-HOST-CORE_HC031S_HC031T_COMBINED_DELTA.zip` into the repository root and allow the listed files to overwrite their HC031R versions.

No files are deleted.

## Validate
Run:

```powershell
npm run validate:hc031s
npm run validate:hc031s-syntax
npm run validate:current
```

The first two commands explicitly verify the Silt currentization preserved inside the combined package. `validate:current` then verifies the final HC031T state and its locked HC031S Silt owner.

## Suggested commit
`HC031T - Combined HC031S Silt Currentization + Open Territory Proof`

## Recommended acceptance order
1. Run the HC031S focused Silt test first with **Shift+6** and export telemetry with **Shift+T**.
2. Then run the HC031T Aperture / Gathering Ground test with **Shift+8** and export telemetry with **Shift+T**.
3. Do not widen into encounter expansion until both causal chains are confirmed and the physical feel is accepted.
