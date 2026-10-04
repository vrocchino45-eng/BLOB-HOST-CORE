# W1 timing baseline — contextual evidence, not a controlled benchmark

| Source | Wall duration | Simulation duration | Total game-loop frames (sampled near end) | Approx ratio sim/wall |
|---|---:|---:|---:|---:|
| HC-031W1 earlier session (`cebca0a7…`) | 742.987 s | 700.311 s | ~21,453 | ~94.3% |
| HC-031W1 fresh playthrough (`4ae7b2b3…`) | 1006.405 s | 526.229 s | ~11,088 | ~52.3% |

Fresh source footage is approximately 921.5 s (encoded at 30 FPS); it ends before the session telemetry export. Encoded video FPS and telemetry game-loop frames must NOT be conflated. Different routes and conditions preclude an apples-to-apples frame-performance comparison. There were 6 surface attachments and 3 physical language completions in the fresh run: do not alter established mechanics to disguise the timing issue.

Observed hypothesis to test, not a verdict: large wall-versus-simulation loss may involve sparse game-loop advancement and a roughly 50-ms update delta cap; window visibility, pause and capture overhead have not been isolated. This kit adds the missing, low-overhead browser scheduling observation. Internal engine update/draw/dt owner instrumentation will still require the exact live source ZIP.
