# HC031T1 — Patch Apply

## Required parent
Apply over the **HC031S + HC031T combined checkpoint** (runtime identity HC-031T / package 0.31.41), or an equivalent repository that already contains both HC031S and HC031T.

Do not apply directly over HC031R or earlier.

## Apply
Extract this delta into the repository root and overwrite the listed files. There are no deletions.

Then run:

```bash
npm run validate:current
```

Suggested commit:

```text
HC031T1 - Adjacent Territory Access + Detachment Truth
```

## Scope lock
This is not the encounter/alive-world pass. Do not add encounters until the focused T1 playtest produces the complete observation → relationship → traversal-open → physical-entry chain.
