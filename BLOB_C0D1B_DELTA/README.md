# BLOB C0D1-B — Host Vascular Effect Relay

**Build mode:** two-owner, unchanged gameplay mechanics; functional three-component spine preparation. Requires C0C-VIS1-B and C0D1-A receiver already installed. No Grave changes in this pass.

## Install

Extract `BLOB_C0D1B_DELTA` in `BLOB-HOST-CORE/` beside `src` and `package.json`, then run from that root:

```powershell
node BLOB_C0D1B_DELTA/apply.mjs --check
node BLOB_C0D1B_DELTA/apply.mjs --apply
node BLOB_C0D1B_DELTA/validate.mjs
npm run build
```

`--check` must report `C0D1A_VIS1B_READY`, or `C0D1B_INSTALLED`. **Never force install on DIFFERENT**. Two changed gameplay owners: `HostConnectionReceiptLedger.js` receives an independent, bounded, immutable applied-effect receipt channel; mounted `VascularRhythmRouteSystem.js` publishes newly applied receiver events into Host. The existing Silt `snapshot()` schema is unmodified. Lineage uses a verified, retained Silt parent and checks positive load increments, capped load, duplicate parents, replay, forged source, sequence gaps, and independent buffer rollovers. No Grave processing yet.

To revert only B (provided the files are unchanged after B):

```powershell
node BLOB_C0D1B_DELTA/apply.mjs --revert
```

**Important:** C0D1-A remains installed after rollback; VIS1-B remains installed in either direction. The B installer retains exact backups in `BLOB_C0D1B_DELTA/backups/`. The included validation runs offline source parity and contract tests; a Windows `npm run build` still needs to be run locally. No new visual gameplay effects expected. C0D1-C is Grave I mounted consumer and a separate pass. Not a completed three-region circuit yet.
