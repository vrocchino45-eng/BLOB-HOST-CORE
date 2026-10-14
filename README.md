# LS1D0 Temporal History — changed-files patch

Apply the three files relative to your BLOB-HOST-CORE project root. **Back up or commit your current changes first.** The ZIP is intentionally not a full project and does not contain node_modules or Git history.

Scope: observation-only runtime exposure per active cell; no save/reload, offline accumulation, new HUD, frequency physics, or grip mechanics. The baseline is captured at initialization to avoid attributing time from before system initialization. Region transition interval is assigned to the currently active cell, a known coarse-grained approximation.

Validation: `node scripts/validateLS1D0TemporalHistory.mjs`. Also run your existing project validators and live playtest before accepting. This patch is based on the uploaded archive, and may conflict with newer local modifications to GameRuntime.js. Do not blindly overwrite that file if your checkout differs.
