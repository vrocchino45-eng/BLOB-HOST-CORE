# G1-D7 reference-image smoke test

Offline applied to five existing BOT1-D6 browser screenshots after invitation. These are not training labels; no image identifies the Fold.

| Screenshot | Cyan candidate count | Largest candidate area (112x64 px) | Novelty from previous |
|---|---:|---:|---:|
| progress_096s.png | 1 | 435 | — |
| progress_117s.png | 2 | 328 | 0.01167 |
| progress_137s.png | 4 | 256 | 0.00844 |
| progress_156s.png | 2 | 336 | 0.00948 |
| progress_176s.png | 2 | 374 | 0.01508 |

Finding: there is observable screen-material structure and nonzero frame-composition change. This does not establish whether the camera is aimed at the Fold, whether the movement direction helps, or whether the landmarks are stable under motion. Owner REC1 must score the future run independently.
