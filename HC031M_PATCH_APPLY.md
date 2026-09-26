# HC-031M Patch Apply

Required parent: **HC-031L**.

Copy the contents of the HC031M delta ZIP over the HC031L project root and allow overwrite.

No files are deleted.

Then run:

```powershell
npm run validate:current
npm run dev
```

The focused test is in `HC031M_FOCUSED_PLAYTEST.md`.
