# BLOB: HOST CORE — LS1D1D2N1V Visible Plate Seating

## Installation

**Changed-files overlay, NOT a standalone game. Apply over LS1D1D2N1.** Overwrite only the two source paths included in this archive. Do not replace the full project, rewrite HC/LS history, or apply the deferred D2E authority guard.

### Modified files

- `src/contact/SiltPlateSeat.js` — records both the original real contact point and a bounded, visible resting position within the existing plate. Same unit ID; environmental ledger ownership and identity remain unchanged. Legacy direct callers without a `sitePosition` keep their former positioning behavior.
- `src/routes/SiltPressureRouteSystem.js` — tells the site its authored plate position; eases the *same existing material mesh* from actual contact to the visible rest position over 0.42 seconds; adds an illuminated socket base, occupied rim, and outlined grain. Hides all socket elements immediately on valid extraction. Presentation finishes while hidden when leaving Silt.

## Why this correction exists

The player's D2N1 recording showed 3 seat/extract pairs, but they reported the ball appeared to disappear. Last-contact seating was found at three disparate positions: one ~0.58 units above the plate, another level with the plate, and another near the rim. The plate's compressed surface also moves vertically. D2N1V provides a clear authored receiving position and geometry for a seated grain. **The first gameplay visibility failure is not considered resolved until the player verifies the rendered result.**

## Behavior / scope

1. Keep D2M's normal LT+A grain acquisition, X Pulse, RT Absorb, D2N1 contact/imprint requirements, and A or LT-release deliberate seating.
2. Once a *legitimate* D2N1 seat transaction succeeds, retain the original grain identity and existing mesh. Preserve its recorded contact position in `contactPosition`.
3. Gently move the rendered grain over 0.42 seconds toward a site-specific position inside 0.32 units of the plate center (radially no farther out than actual contact), with its center 0.22 units above the original plate reference elevation. An illuminated pedestal and ring support the grain at that final position; a light wireframe outline identifies it as the seated material, not a new object.
4. Core movement or grip release no longer hides the seated grain; it remains anchored as D2N1 specified. No new force, collision, chemistry or progression credit is created.
5. On the existing intentional successful extraction, hide the socket's base, ring, and outline, and restore the same grain to its normal Core-held manipulation.
6. All other Silt grains follow their old authored cycle; no trajectory memory is introduced. Site occupancy remains local to the game runtime, not durable across save/load.

**Locked:** D2I movement numbers (+0.28 Pulse, 0.72/sec Absorb, 0.38–1.60 tether), D2M contact pressure and brace decisions, targeting and interaction inputs, eight-unit identity/mass, Silt progression, other environments, Core/Guide, and no authority transfer on seating.

**Known edge:** The prior D2N1 observation showed seated grains extracted again within 0.42–0.90 seconds. This overlay intentionally **does not change extraction controls or add a re-grip cooldown**. A quick subsequent LT+A can still retrieve the grain. For the next test, allow the seat to settle, then move the Core away without pressing A again. If inadvertent re-extraction persists, diagnose it separately before changing input authority.

## Manual field acceptance

1. Install over D2N1. Record with **Alt+Shift+R**.
2. Acquire a Silt grain with LT+A, establish Stabilized plate contact, then X Pulse twice to imprint.
3. Release A or LT once. Check for a visible grain settling into a raised amber socket within half a second; the plate should remain visibly occupied while you move away farther than the original grip tether.
4. **Wait 15 seconds** without re-acquiring it. Check the same grain remains present; observe the other free grains continue circulating.
5. Return, aim at the seat, press LT+A once to extract the same grain. The pedestal, rim, and outline should turn off on extraction; RT / X behave normally.
6. Repeat and try another material grain while the plate is occupied. The original occupant must not be displaced or cloned.
7. Stop Alt+Shift+R and export Alt+Shift+E as `BLOB_LS1D1D2N1_OBSERVATION.json` (recorder still uses the existing D2N1 pass filename). Describe whether the grain *visibly remains on the plate*.

## Validation

- Two modified source files pass Node 22 syntax checks.
- 75 targeted source-level assertions pass using a minimal Three.js presentation stub plus actual D2N1V route method bodies, authentic SiltPlateSeat and SiltLivingMaterialCycle classes. Includes three recorded contact points, 25s numeric retention, geometry marker cleanup, and independent material-cycle behavior.
- This is **not** a Vite/browser/WebGL render test. Source-level checks do not prove the marker is visible through all environmental geometry or that the control feel is correct.
- No automated test claims actual 3D physics, global persistence, or off-route material simulation.

**Next intended phase:** only after visible seating is field-confirmed, test trajectory-memory design (D2O) as a separate motion-ownership milestone.
