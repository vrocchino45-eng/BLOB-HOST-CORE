# HC031U Patch Apply

Parent required: HC031T6.

Overlay the contents of the HC031U delta ZIP directly onto the HC031T6 project root, replacing matching files. Do not delete unrelated files. Do not copy node_modules from the package.

Expected identity after apply:
- build: HC-031U
- label: Gathering Ground Alive Pass 1
- package version: 0.31.48
- telemetry: blob.session.telemetry.v1.47

Run `npm run validate:current` after overlay.
