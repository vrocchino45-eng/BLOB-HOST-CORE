# GitHub Actions migration assessment

Start with an approved verification-only job, a pinned Node major and a lockfile install. Keep outputs scoped and pin actions and runner/browser revisions when a workflow is reviewed. This is a migration assessment based on local test evidence. [GitHub Node.js guide](https://docs.github.com/en/actions/automating-builds-and-tests/building-and-testing-nodejs)

| Tier | Candidates and prerequisites |
| --- | --- |
| First | The 11 directed-launch tests, 245 maintained cases, scenario-contract checks, owner/receipt assertions, Core profile sampling, C63 route readiness/static access, recipe validation and production Vite build. See the exact [Wave 03 regression gates](wave-03/v1/verification/regressions.json). Confirm case-sensitive paths and line-ending policy on fresh runners. |
| Next | C01 receipt chain, B02 Core Work, stabilized targeting and bounded browser replay. Pin the installed Playwright/browser revision and required WebGL support. Start on Windows to establish parity and record actual renderer, staged execution, absent coverage and timeouts. Consider browser gates independent of fast per-change tests. |
| Keep local | Headed controller, workstation GPU and capture timing, phone readability, HC027D1 listening and human Experience. Keep full E: archive and publish only reviewed evidence. |
| Exceptions | Preserve LS1E1 and LS1E2 as baseline signatures until their separate owners repair the old fixtures. |

Use authenticated workflow artifacts for short-lived scoped TAP, logs and telemetry, with retention and access stated on the index. Keep final review media and archive checksums under the evidence standard. No workflow, runtime source or dependency is changed by this assessment.
