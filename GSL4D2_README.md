# BLOB GSL-4D2 — blind silhouette recognition

Mode: isolated validation. No LS1, runtime, physics, GSL-4C motion, or audio changes.

Open `GSL4D2_RECOGNITION_LAB.html` in your browser. Click **Start 24-trial blind test**. For each randomized still frame, click the expression you think you see, then **Next trial**. At the end click **Export recognition JSON** and upload `GSL4D2_RECOGNITION.json`.

This tests 3 static frames for each of 4 states in both baseline and expressive visuals (24 trials). Answers are withheld until the end; the JSON includes a confusion matrix. GSL-4C motion equations, original four events, and seven pulses remain unchanged. The test is static, so it does not establish animation readability, emotional quality, or gameplay validity.

PowerShell:
```powershell
cd "$HOME\Documents\GitHub\BLOB-HOST-CORE"
Expand-Archive -LiteralPath ".\BLOB_GSL4D2_RECOGNITION_DELTA.zip" -DestinationPath "." -Force
Start-Process ".\GSL4D2_RECOGNITION_LAB.html"
```

Acceptance: 24 completed answers, all four states sampled equally for each visual, no labels visible during guessing, valid confusion matrix. Promotion threshold for expressive visual to be chosen after analyzing recognition results, not assumed.
