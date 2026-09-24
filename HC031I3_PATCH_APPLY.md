# HC031I3 Delta Package — Apply Instructions

Required base: **HC031I2 — Entry Sequence and Residue Coherence Lock**.

1. Make a backup copy of the HC031I2 project folder.
2. Extract this ZIP directly into that HC031I2 project folder.
3. Allow the extraction tool to overwrite matching files.
4. No files need to be deleted for this update.
5. Run `npm run validate:current`, then `npm run dev`.

This delta contains only files added or changed between HC031I2 and HC031I3. It is not a standalone project and should not be extracted into an empty folder.

Future BLOB build deliveries will use this delta format by default and will state the required base build. A complete checkpoint ZIP can still be produced when the chain becomes inconvenient or a new canonical baseline is established.
