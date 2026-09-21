# HC-004QH Acceptance Tests

- [x] Fresh Grave-bed presence does not activate the seam micro-exit.
- [x] Fresh micro-exit state remains `progress=0`, `completed=false`, and waits for the seam cell.
- [x] Initial Grave arrival no longer forces `activeCellId` after seam arrival begins.
- [x] Completed seam arrival retains the scar-memory seam cell before fold-back.
- [x] Real fold-back returns the runtime to the Grave bed and publishes `handoffComplete=true`.
- [x] Seam arrival relinquishes ownership after fold-back.
- [x] Earlier Grave read/stability/readiness layers remain inactive after downstream ownership.
- [x] Post-seam response becomes diagnostic and target-focus owner.
- [x] First expected/actual post-seam target is `old_core_husk_memory_001`.
- [x] All validators pass.
- [x] Undefined-method audit passes.
- [x] Production build passes.
- [x] Vite startup returns HTTP 200.
