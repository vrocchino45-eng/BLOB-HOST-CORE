# BLOB • C0E3-LANG1 • Ability, HUD and Lore–Math Contract

**Status:** Read-only UI convergence installed by the accompanying guarded patch. The lore-driven physics extension below is a **proposal only**, not a silently deployed physics change.

## 1. Which system owns which truth?

| Layer | Current owner | May claim |
|---|---|---|
| Input intent | `InputSystem`, `VerbCompositionSystem` | Button intent and chord, not target acceptance |
| Focus/target | Targeting and regional owner | Relationship candidate and whether action was consumed |
| Silt physical test | `SiltPressureRouteSystem` and material subowners | Grain trajectory, contact brace, seating, absorb commit, pressure completion |
| Local chemistry proxy | `RegionalTerritoryCoupling` | Bounded local state (imprint, strain, void), neighboring updates |
| Traveling *presentation* | `RegionalTerritoryDynamics/Expansion` | In-flight packet, arrival animation, relief flash; **not physical grain transfer** |
| Interregional Host | Host receipt ledgers, Vascular/Grave owners | Authentic sequenced causal signals and their local consequences |
| UI | `PlaytestHudSystem` + `HostLanguageGrammar` | A *readout* of published states, never a gameplay authority |

**Do not conflate** the Silt physical grain experiment with a C0E1/C0E3 decorative-local experimental site. They can share verbs but do not transfer ownership automatically.

## 2. Canonical abilities (the same everywhere)

| Universal input | Glyph | Universal intention | Contextual result examples | Risk |
|---|---|---|---|---|
| X: Pulse | ▽ | PROJECT outward; LISTEN for response | Silt: pressure read or push; Vascular: timed valve response; Grave: resonance read | Overpressure, recoil, rupture |
| RT: Absorb | △ | DRAW inward; selectively TAKE IN if eligible | Silt: draw **versus** material commit; Grave: safe residue transfer | Contamination, loss of safe boundaries |
| LT: Stabilize | ◇ | HOLD coherence / BRACE a relationship | Silt: contact brace; Vascular: coherence through contraction; Grave: settle resonance | Overbinding, frozen flow |
| A: Interact | • | INSPECT / CONFIRM / COMMIT contextual interaction | Hub route commit, ordinary observation | **Not a fourth physics verb** |

The player-facing verbs never switch names across regions. The active **material and state** determine their consequences. Guide is the interpreter of focus/meaning, not a fourth universal trigger.

The existing `VerbCompositionSystem` has eight chord states: observe, project, draw, hold, braced project, braced draw, opposed exchange, high-strain balance. Its action multipliers remain authoritative. This pass changes **labels only**.

## 3. Distinguish the three unrelated triads

1. **Anatomical 3→6→12:** Three functional roots, six counterpart/paired relationships, twelve phase resolutions. The present regional layout has *three sites and six directed links per region*, but these are not proof of twelve unique biological reactions.
2. **Three player verbs:** Pulse, Absorb, Stabilize. Combined actions form chords. This is an input/composition grammar, not identical to organ count.
3. **Three experimental readings:** `strain`, `imprint`, `void` (normalized 0–1). They are bounded **local-site** measurements; they are not Core health, Host progress, or whole-world substance mass.

## 4. Mathematical reading: source-derived **existing** laws

In C0E2-B the site state is \(x_i=(I_i,\sigma_i,V_i)\), with all components in \([0,1]\). For an input \(\Delta>0\) to one component, a fixed regional share \(q_r\) goes outward and \((1-q_r)\) attempts to stay locally. The two neighbors share equally, limited by each neighbor's remaining capacity. If the source is full, a region-specific fraction \(o_r\) of the overflow gets another redistribution attempt. The remainder dissipates. No additional matter is generated.

| Region | Existing share \(q_r\) | Existing overflow share \(o_r\) | C0E3 relief when fully saturated |
|---|---:|---:|---|
| Silt | .26 | .72 | Strain relief up to .075 / 1.45s cooldown |
| Vascular | .34 | .80 | Strain relief up to .068 / 1.20s |
| Grave | .22 | .56 | Void relief up to .052 / 1.65s |
| Hub | .28 | .70 | Strain relief up to .062 / 1.30s |

**Example — Silt Pulse, all sites empty:** existing Silt response adds \(0.25\) strain. \(0.25(1-0.26)=0.185\) remains in the source, and each neighbor accepts \(0.25(0.26)/2=0.0325\). The sum equals \(0.25\). The visual traveling packet is not the physical transport of a grain. A wave finish counter includes **both** neighbor-delivering transmissions and local dissipations, so it cannot be labeled a material arrival.

When the source is already at 1.0 strain and both neighbors are empty: the direct source allocation \(0.185\) overflows; the outward amount is \(0.065+0.72(0.185)=0.1982\), divided to \(0.0991\) each neighbor. \(0.0518\) dissipates, matching the original \(0.25\) effort. Any neighbor already full can accept less; the remainder dissipates.

**Accounting rule:** \(\Delta^+=\Delta_{local}^+ + \sum_j T_{i\to j} + D\), up to numerical tolerance, for a positive component response *before a later relief action*. Negative component changes and C0E3 deliberate relief must be accounted for separately. Never mix normalized readout with real mass or energy units.

## 5. Lore–math extensions — **NOT CURRENTLY IMPLEMENTED**

The Host's language may eventually modulate coefficients:

- **Flux:** available impulse/strain \(\sigma\), which affects propagation pressure and fatigue.
- **Form:** retained structure/imprint \(I\), which influences stability but may become overbound.
- **Void:** an extraction trace \(V\) created by drawing, *not* a free storage-capacity meter.
- **Between:** dimensionless conductance \(B_{ij}\) of a *relationship*, not independent free material.
- **Residue:** historical memory \(M_i\), sourced from actual authenticated events, not invented local lore progress.

One candidate model is \(B_{ij}=q_r a_{ij}p_{ij}\), with:

\[a_{ij}=\exp[-k_\sigma|\sigma_i-\sigma_j|-k_I|I_i-I_j|]\]

\[p_{ij}=\operatorname{clamp}_{[0,1]}(1-\lambda I_j-\mu V_j)\]

\[T_{i\to j}=\min(\Delta^+ B_{ij}w_{ij},\ 1-x_j)\]

Weights \(w_{ij}\) must be normalized across the two outgoing links, then unused input must be explicitly credited to source or dissipation. **These are candidate equations and coefficients, not a claim about current code.** The model can express an actual lore distinction: two anatomically connected sites can carry different responses because their strain history and material permeability differ. Calibration needs replay tests across existing Silt/Grave/Vascular fixtures before physical integration.

## 6. HUD labeling rules

Normal HUD, while in one of four regions, uses **at most three small supplementary lines**:

```text
▽ PULSE·PROJECT   △ ABSORB·DRAW   ◇ STABILIZE·HOLD
MODE BRACED PROJECT · POROSITY SHELF · FLUX strain 75 · FORM imprint 20 · VOID trace 17
BETWEEN LOCAL · 2 traveling · 9 wave finishes · 3 relief
```

The example uses fixture values, **not a claim about any uploaded playthrough**. The actual UI reads only published `frameState.verbComposition` and `frameState.territoryExploration` values. If the site is not in range or unmounted, it labels that state; it never shows a stale state as a current measurement. The original route objective, controls, status, and technical pages remain untouched.

Never label `100% route complete` as physical strain or saturation. Never label `Pulse pressed` as `Pulse accepted`. Never infer a Host receipt from a local `Between` animation.

## 7. Locks and acceptance

- **Mode:** Convergence + language/visual pass. **No physical rule change.**
- **Allowed:** shared vocabulary; read-only HUD readout; documented numerical interpretation; local-language tests.
- **Forbidden:** altering Core input mapping, targeting, movement, regional equations, Host receipts, progression, particle physics, or save formats.
- **Preserved:** HC031L verb composition, C0E2-B coupling, C0E3 propagation, C0D Host causal chain.
- **Delete/disable targets:** none in this compatibility-first pass; later audit old duplicated HUD aliases before removing them.
- **Acceptance:** one verb name across four regions; correct chord labels; 0–100 displayed from actual site values; `out of range` cannot imply read; no false Host/chemistry claims; source hash guard; rollback; full project Windows build; four-region controller playtest.
- **Regression:** original REC1 export, Silt physical grip/brace/release, 3→6→12, C0E2-B accounting, C0E3 active waves, Grave II, and return-to-Silt logic.

**Next decision:** after seeing the HUD in the browser, choose whether to trial the candidate Between law in an isolated numerical sandbox before any live gameplay physics swap.
