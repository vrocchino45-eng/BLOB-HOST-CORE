# HC-006KA Build Report

## Mode
Progression prerequisite / gate ownership repair.

## Purpose
Close the Hub departure leak without changing the existing Grave route content.

## Changed runtime ownership

- `GateSystem`: route readability vs crossability.
- `ThirdLocalCellMorphSystem`: authored Hub departure prerequisite guard.
- `HubChamberFoundationSystem`: active route reports readable before self-reading and crossable after it.
- F1 overlays: report readable/crossable/blocker state.

## Expected lock result
The player must complete the first Hub self-reading before the active Grave Memory route can be crossed.
