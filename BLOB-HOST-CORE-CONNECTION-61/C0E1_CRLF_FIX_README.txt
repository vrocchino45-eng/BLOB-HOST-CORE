BLOB C0E1 — Windows CRLF installer compatibility fix

Purpose: Replace ONLY BLOB_C0E1_COMPOUND_DELTA/apply.mjs in your current BLOB-HOST-CORE project folder. This does not modify any gameplay source file until you explicitly run --apply.

Confirmed discrepancy: src/hub/HubChamberFoundationSystem.js currently has the known Windows CRLF form of the required C0D4-MOB1 source (SHA-256: 7f62cbf50b0d6f78348ccded5629ddcb81299792f50e8e65121fa179e0ea44f1). Normalizing only CRLF to LF reproduces the exact required SHA-256: d9a8d4c18af73c853381f63cf4d5a6954fe7039a7f17a6630bc95df6d95ec842. The installer accepts ONLY this verified variant or the original exact LF source.

The original BLOB_C0E1_COMPOUND_DELTA folder, including its payload, MANIFEST.json and validate.mjs, MUST already be present.

Steps:
  1. Extract this ZIP into the BLOB-HOST-CORE project root; agree to overwrite ONLY BLOB_C0E1_COMPOUND_DELTA/apply.mjs.
  2. Run in the project root:
       node BLOB_C0E1_COMPOUND_DELTA/apply.mjs --check
       node BLOB_C0E1_COMPOUND_DELTA/apply.mjs --apply
       node BLOB_C0E1_COMPOUND_DELTA/validate.mjs
       npm run build
  3. For rollback, only if C0E1 source is unchanged:
       node BLOB_C0E1_COMPOUND_DELTA/apply.mjs --revert

Safety: byte-for-byte backups are created for modified source files; original Windows CRLF text is retained if present. Arbitrary source changes, missing payloads, tampered payloads, divergent post-install files, and unknown alternate newline versions are rejected.

This fix is installation compatibility only. Windows Vite build and browser gameplay acceptance must be verified on your machine.
