# HC-006J — Hub Chamber Foundation

## Purpose

Establish the first real Hub Chamber presentation around the proven Signal Chorus runtime without reopening Surface Wake or Guide Threshold and without expanding into new route content.

The HOST CORE blueprint defines Hub Chamber as an internal junction with a central anchor, three visible gates, one active route, dormant gates, a first memory fragment, and first Status Page use. HC-006J implements the spatial and route-readability portion. Status Page use remains a separate lock pass.

## Ownership

| Domain | Owner |
|---|---|
| Hub scene behavior | `HubMode` |
| Authored Hub identity | `RegionRegistry` |
| Route gate data | `GateRegistry` |
| Hub objective data | `ObjectiveRegistry` |
| Camera profile | `CameraProfileRegistry` |
| Material/shape language | `VisualLanguageRegistry` |
| Junction presentation | `HubChamberFoundationSystem` |
| Route availability | `GateSystem` |
| Objective completion | `ObjectiveSystem` |
| UI readout | Guide/HUD/debug systems, read-only |

## Spatial grammar

```text
                     Grave Memory
                       ACTIVE
                         |
Vascular Rhythm — central junction — Silt Pressure
    DORMANT          + memory shard       DORMANT
```

The routes are physical world structures, not menu options. Dormant routes are visible but non-targeting and cannot transition.

## Interaction relationship

The existing Signal Chorus layered reading remains the prerequisite for route identities to separate clearly:

```text
complete Guide Threshold
→ arrive at Signal Chorus memory core
→ complete layered Signal reading
→ Hub junction resolves around the core
→ read one active and two dormant route identities
→ Hub route-read objective completes
```

No additional input is required merely to reveal the foundation.

## Camera

The persistent close camera remains player-selected. After Signal Chorus completion, the generic inspection system adopts the Hub junction focus with a pulled-back, central, interpretive framing profile. Losing the local focus returns to player-forward tight view rather than forcing the player back to orbit view.

## Deferred work

HC-006K should implement the first Status Page use and route readout lock. The full Hub must not be declared locked until that requirement is readable with controller navigation.
