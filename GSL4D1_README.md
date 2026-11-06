# BLOB GSL-4D1 — expression readability isolated delta

Scope: only standalone HTML lab; no game runtime or LS1 files. GSL-4C motion equations and four signal events preserved.

Open GSL4D1_EXPRESSION_READABILITY_LAB.html in a browser. Select GSL-4C controlled recovery motion. Compare Visual: round baseline vs expressive. Toggle Blind recognition to hide the phase label and judge curiosity, support, concern and idle by appearance alone.

Save current run after playback or Run all modes + save, then Export entire session JSON. The combined JSON includes the visual-mode and blind-test settings per run. Note that recognition judgments are NOT captured by JSON: send observations or a short video separately.

PowerShell:
cd "$HOME\Documents\GitHub\BLOB-HOST-CORE"
Expand-Archive -LiteralPath ".\BLOB_GSL4D1_EXPRESSION_READABILITY_DELTA.zip" -DestinationPath "." -Force
Start-Process ".\GSL4D1_EXPRESSION_READABILITY_LAB.html"

Limitations: fixed stationary mock Core; expressive shape is an experimental design, not an approved character asset; no runtime integration, no sound.
