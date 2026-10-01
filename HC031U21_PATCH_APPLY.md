# HC031U2.1 Patch Apply

Parent: **HC031U2** (`0.31.50`)
Successor: **HC031U2.1** (`0.31.51`)

Extract the ZIP over the HC031U2 project root and allow replacement of matching files. No deletions are required. Do not copy `node_modules` from another machine.

After apply, `npm run validate:current` should execute the U2.1 validator/smoke/bot first, then inherited U2/U1/U checks.
