# HC031T Delta Apply

## Required parent
`HC-031S — Silt Pressure Relationship Currentization`

Do not apply HC031T directly over HC031R or an earlier build. HC031T is a small delta whose unchanged-file hashes assume HC031S.

## Suggested Git branch
`HC031T-Open-Territory-Adjacent-Host-Proof`

## Apply
Extract `BLOB-HOST-CORE_HC031T_DELTA.zip` into the repository root and allow the listed files to overwrite their HC031S versions.

No files are deleted.

## Validate
```powershell
npm run validate:current
```

Expected primary line:
`[HC031T] PASS — Gathering Ground now moves from distant ghost context to remotely readable/reactive neighbor to continuously reachable local territory without teleport or active-cell change; ApertureFieldsArrivalSystem remains bounds owner and 22 neighboring gameplay owners are unchanged.`

## Suggested commit
`HC031T - Open Territory Adjacent Host Proof`
