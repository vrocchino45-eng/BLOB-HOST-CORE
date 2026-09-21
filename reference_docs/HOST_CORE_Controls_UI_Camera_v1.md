# HOST CORE Controls UI Camera v1

## 15. HUD, Menu, Runtime Interaction, and Controls

The HUD should feel like the core's perception layer, not a normal sci-fi overlay. It answers:

```text
Where am I?
What is happening here?
What am I trying to do?
What can I interact with?
What state is my core in?
```

### Main HUD

- Top left: region name and host function
- Top center: current objective
- Top right: compact core status
- Center/world: contextual prompt near target
- Bottom left: Coherence, Charge, Growth
- Bottom right: ability petals and inputs

### Status Page

The Status Page is the core's self-reading, not a normal pause menu.

V001 tabs:

```text
Core | Chemistry | Region | Controls
```

Future tabs:

```text
Core | Abilities | Chemistry | Orbiters | Region | Objectives | Entities | Relics | Map | Controls | System
```

### Runtime Rule

```text
GameState owns truth.
PromptSystem chooses active prompt.
HudSystem displays.
StatusPage explains.
UI does not mutate gameplay state.
```

---


## 16. Controls

Controls should be simple first and expandable later. Movement must be easy. Pulse and absorb are the two base verbs. Stabilize is held. Interact/scan/cross is one obvious action.

### Keyboard / Mouse Gameplay

| Input | Action |
|---|---|
| WASD / Arrow Keys | Move |
| Mouse | Aim / soft look |
| Left Mouse | Pulse |
| Right Mouse | Absorb |
| Q | Stabilize / brace |
| E | Interact / scan / confirm / cross |
| F | Guide focus / target lock |
| Shift | Boost / push |
| Tab | Status Page |
| Esc | Back / pause |
| R | Recenter camera |

### Controller Gameplay

| Input | Action |
|---|---|
| Left Stick | Move |
| Right Stick | Aim / soft camera look |
| A | Interact / scan / confirm / cross |
| X | Pulse |
| RT | Absorb / draw |
| LT | Stabilize / brace / shield hold |
| B | Back / cancel / dodge later |
| Y | Guide focus / status quick inspect |
| LB / RB | Cycle ability petals / tabs |
| D-Pad | Menu navigation / quick hints |
| L3 | Boost / push |
| R3 | Recenter / target lock |
| View / Select | Status Page |
| Menu / Start | Pause |

---


## 17. Camera and Cinematic Runtime

The camera is the player's sense of scale, direction, danger, wonder, and relation.

It must:

```text
Make play readable.
Make the world feel alive.
Make scale revelations land.
```

### Camera Modes

| Mode | Use | Feeling |
|---|---|---|
| Landing Camera | Surface Wake, pockets, chambers | intimate, tactile, readable |
| Threshold Camera | gates, seams, crossings | ceremonial, directional, held breath |
| Rail Camera | currents, threshold pulls, charge spans | flow, speed, pressure |
| Hub Camera | Hub Chamber and junctions | central, interpretive, readable choice |
| Field Camera | Aperture Fields and open ecologies | open, inhabited, systemic |
| Macro Reveal Camera | Host Overlook, Helix Vista, Beyond | awe, scale, nested truth |
| Inversion Camera | Strand B regions | uncanny, elegant, destabilizing |
| Cinematic Camera | major reveals | truth revelation, not random spectacle |

Cinematics should be short, earned, and emerge from play.

---


## 18. Scene Readability Rules

Every scene should have three readable rings.

| Ring | Purpose | Must Show |
|---|---|---|
| Immediate Play Ring | local gameplay clarity | player, obstacles, nearby nutrients/entities, ability effects |
| Objective Ring | next meaningful action | guide tether, seam/gate, landmark, objective target |
| World Meaning Ring | mood and scale | host anatomy, distant routes, ecology, macro silhouettes |

Important target readability requires at least two cues: motion, glow, shape contrast, guide tether, sound/tone, prompt, entity behavior, or route lines.

Safe and unsafe states should not rely on color alone. Use shape, rhythm, motion, sound, prompt, and Guide behavior.

---


