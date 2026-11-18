# C0C3 Convergence Report

- **Mode:** Convergence / one-owner adapter
- **Scope:** `src/contact/SiltCompressionContact.js` accepted pressure add and authorized recovery only
- **Baseline provenance:** Last available D2M contact-arbitration overlay; local worktree not directly inspected
- **Locked:** Grip, targeting, geometry thresholds, brace arbitration, temporary imprint logic, source Host receipts, material conservation, camera, Vascular, REC1, HUD, chemistry
- **Delete/disable targets:** Duplicated two owner-local math expressions only; zero files removed
- **Visual/feel:** No intended difference
- **Offline tests:** 36,450 assertions PASS (12,144 full-update A/B comparisons), C0C2 24,234 assertions PASS
- **Not yet tested:** User's installed source-hash parity; local Vite browser; live REC1 Silt pressure+imprint regression
- **Failure criteria:** Any divergent original/full snapshot, event order, accepted/rejected branch, grip reset, imprint timing, or Source Host receipt that appears because of pressure alone
- **Go/no-go for C0C4:** Run local validator + Silt physical test first. If no regression, migrate Vascular independently.
