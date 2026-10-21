# C0C4 Convergence Report

**Result:** OFFLINE_VASCULAR_OWNER_PARITY_PASS. **Local gameplay acceptance:** pending.

- Compared 12,397 complete receiver snapshots plus exact underlying state against the **unmodified, SHA-verified LS1E2 receiver**. 117,393 assertions.
- Receipt validations exercised 5,820 times, mounted-owner decay 6,531 times, including zero/negative/large/nonfinite delta times, cutoff, saturation, authenticated and forged provenance, duplicate and sequence-gap handling.
- All three regression scripts passed when assembled together: C0C4 117,393; C0C3 36,450; C0C2 24,234 assertions.
- Actual runtime diff consists only of the import and two accumulator expression replacements; no alterations to the Vascular route owner, source ledger, local flow formula or Silt system.
- Browser compilation, local source-hash preflight, and C0C5 field test remain to be performed by the user.
- Special note: the older C0C2 validator prints a stale hardcoded `kernelUnusedByGameplay: true` field. The C0C3 and C0C4 adapters now **use** the C0C2 utility. Do not interpret that field as authoritative.

Next gate: obtain screenshot of `node scripts/validateC0C4Vascular.mjs` and `npm run build` plus short C0C5 REC1 capture of actual Silt → Vascular response.
