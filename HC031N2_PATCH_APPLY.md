# HC031N2 Patch Apply

Required parent:
- HC-031N1 — Physical-Language Causal Continuity
- include the previously supplied Windows validator portability fixes (`validateRecipeDataLoad.mjs`, `auditUndefinedThisMethods.mjs`, and portable HC031N1 hash validation)

Apply the contents of the HC031N2 delta ZIP to the repository root and replace matching files.

Then run:

```powershell
npm run validate:current
```

Expected first line of pass result:

`[HC031N2] PASS`

No files are deleted by this delta.
