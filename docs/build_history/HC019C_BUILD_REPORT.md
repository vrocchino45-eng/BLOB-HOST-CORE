# HC019C — Read Matter Without Instructions

## Mode
READABILITY / CONVERGENCE ONLY.

## Goal
Make the HC019B Surface Wake matter-state obstacle communicate through the material itself,
then reduce player-facing instructions instead of adding more text.

## Material visual language
- Unread: muted, irregular silhouette and jittery wake.
- Pulse-read unsafe: hazard protrusions become high-contrast and obvious.
- Stabilizing: hazard structures physically retract while the packet coheres.
- Safe: the packet becomes steady, greener, calmer, and its wake tightens.

These states are derived only from existing packetIdentified, packetPurity, and stabilizingPacket truth.

## Prompt reduction
Surface Wake player-facing prompts now describe material state rather than spelling out
the button sequence. The detailed development/debug fallback remains available.

## Locked
Boundary/crossing authority, layered fold logic, Guide Threshold, movement, camera,
BondSystem, ChemObjectSystem, chemistry, ranges, and all completion rules remain unchanged.

## Acceptance
With the HUD ignored, the material should increasingly read as:
unread -> hazardous -> being stabilized -> safe.
