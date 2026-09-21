# BLOB: HOST CORE — HC015N

## Mode
Gameplay / convergence.

## Blueprint basis
HOST_CORE_Blueprint_v1 places Membrane Ridges immediately after Signal Plains in the Act 2 Host Ecology / Field Band and defines this band around the question: **How do my actions affect living systems larger than me?** It also classifies Aperture Fields / Signal Plains as wide explorable ecology fields.

The blueprint does not prescribe a specific Membrane Ridge minigame. HC015N therefore keeps the implementation deliberately narrow and reversible.

## Purpose
Make the space between Signal Plain and the next objective become gameplay rather than another button-trigger sequence.

## Mechanic
After Signal Plain is complete, three living pressure contours appear around the existing Membrane Ridge. The player reads them by physically moving through/along each contour.

Progress:
- requires proximity to the active contour;
- requires actual player translation;
- does not advance while standing still;
- does not require Pulse/Absorb;
- advances sequentially across three contours;
- remains local to Aperture Fields and does not mutate global progression.

## Locked
- HC015K Signal Plain completion response.
- HC015L Tight Camera behavior.
- HC015M deeper-field movement envelope and landmark handoff.
- Existing controller mapping.
- Existing global chemistry/progression.

## Forbidden in this pass
- No new currency.
- No teleport.
- No new route gate.
- No Gathering Ground gameplay.
- No new combat/entity layer.
- No replacement of existing Signal Plain gameplay.

## Acceptance
1. Complete Signal Plain normally.
2. Move deeper to Membrane Ridge.
3. HUD changes to Membrane Ridge contour 1/3.
4. Standing still near a contour does not fill it.
5. Moving through/along its bright receptive edge fills progress.
6. Three contours can be read in sequence.
7. Completion reports `pressure read / Gathering Ground visible`.
8. Player remains in the same open Aperture field.
