# BLOB: HOST CORE — HC-031W2B Visual Hierarchy / World Readability Convergence Plan

Date: 2026-10-08
Baseline: HC-031W1 visible identity + W2A conditional performance lock through HC-031W2A5.4
Mode: convergence / presentation-only readability

## 1. Why W2B exists

W2A established a stable-enough runtime foundation. Settled Scar/Hub play returns close to real-time, but the original HC-031W1 playthrough still shows a perceptual problem through the middle of the slice: translucent cyan/teal anatomy, additive route/current graphics, foreground tissue, and distant Host structure frequently occupy the same visual priority. The result is spatial flattening even when the underlying world geometry is correct.

W2B is not a relight, art-style replacement, or navigation-assist pass. Its job is to make the existing Host readable in the order:

**near actionable Host > Core / Guide > supporting anatomy > distant Host**

without quest arrows, global brightening, HUD dependence, or conventional level geometry.

## 2. Audit findings

### Surface Wake — reference / lock

Surface Wake already contains an explicit depth model. Authored proxy anatomy is tagged foreground/background, foreground landmarks use lower opacity than background landmarks, volume motes carry foreground/middle/background depth roles, and interaction effects are comparatively local. The opening therefore remains the reference for W2B rather than a change target.

### Scar Flow / Guide Threshold — additive-support stacking

Two separate systems draw full-path additive current language at the same time:

- `GuideThresholdGameplaySystem` — additive current strands, motes, pressure bodies, convergence marker.
- `GuideThresholdLayeredInteractionSystem` — additional full-length additive strands, settling ribs, response rings, 16 current motes, focus marker, and point light.

The Layered Interaction strands can rise substantially above their authored base opacity as energy/guidance increases, while the Gameplay fill also raises full-path strand and mote opacity. In the HC-031W1 video this reads less as a local current and more as a cyan volume laid over the entire view. The local focus marker, response bodies, Core, and Guide then compete with the support path rather than owning it.

### Hub — foreground tissue competes with the chamber

Hub already has strong structural truth: explicit foreground/middle/background tags, route screen-separation checks, distant-Host projection limits, and a hierarchy that conceptually places Core/Guide ahead of objective echoes and background Host anatomy.

However, authored Hub tissue currently gives foreground bodies approximately the same or greater opacity than background bodies. Large near-camera translucent bodies therefore behave like a screen wash instead of a framing layer. This conflicts with the otherwise-good Hub depth metadata and with the opening's more successful treatment of foreground anatomy.

### Aperture — separate later issue

The late Aperture section becomes too dark and loses local actionable contrast, but fixing it in W2B1 would mix two problems: mid-slice depth flattening and late-slice low-light readability. Aperture should be handled after the depth hierarchy rule is proven in Scar/Guide/Hub.

## 3. W2B locks

The following are locked for W2B unless a regression proves otherwise:

- W2A timing architecture: A4 bounded catch-up and A4.1 work partition.
- W2A presentation/performance infrastructure through A5.4.
- Controls and controller mappings.
- Player movement / surface contact / detach / reacquire behavior.
- Target ownership and Stabilize + RS redirect policy.
- Pulse / Absorb / Stabilize mechanical authority.
- Chemistry, ecology memory, route logic, progression, Hub destination logic.
- 3→6→12 grammar.
- HC027D1 audio reference and mix headroom.
- Existing camera behavior.
- Existing world geometry and route placement for W2B1.

## 4. Forbidden W2B1 scope

Do not:

- globally brighten the scene;
- add quest arrows, waypoints, labels, objective beams, or new HUD guidance;
- add new world geometry, particles, or draw-call-heavy effects;
- change fog/camera/exposure globally to mask hierarchy problems;
- alter route geometry, collision, progression, timing, or controls;
- re-open W2A renderer architecture;
- make Pulse/Sonar the only way the scene is readable;
- remove the Host's sense of scale by flattening all distant anatomy.

## 5. W2B1 — Depth Hierarchy Foundation

### Purpose

Prove the hierarchy rule in the current middle slice without adding content.

### Allowed files / ownership

Primary implementation targets:

- `src/morph/GuideThresholdGameplaySystem.js`
- `src/morph/GuideThresholdLayeredInteractionSystem.js`
- `src/morph/ScarFlowArrivalSystem.js` only where arrival-role presentation needs explicit weighting
- `src/hub/HubChamberFoundationSystem.js`

Reference-only / locked unless evidence requires otherwise:

- `src/opening/SurfaceWakeEcologicalCausalitySystem.js`
- `src/presentation/VisualHierarchyCompressionSystem.js`
- targeting / verb physicalization owners

### Visual change strategy

#### Scar / Guide

1. Demote the two full-length additive path systems from primary information to support information.
2. Keep the existing local focus marker, current motes around the current focus, settling ribs, response rings, Core, and Guide as the readable local layer.
3. Reduce constant full-path additive opacity and point-light dominance; allow deliberate stage/response beats to lift briefly rather than keeping the entire route bright.
4. Preserve cyan/amber grammar and living-state modulation; this is hierarchy tuning, not recoloring.
5. Keep the route discoverable by shape/motion even when the support current is quiet.

#### Hub

1. Preserve the existing foreground/middle/background metadata and route truth.
2. Attenuate large near-camera foreground tissue so it frames the view instead of tinting the whole screen.
3. Keep middle/route territory silhouettes more stable than the foreground veil.
4. Preserve the existing distant-Host projected-dominance limit and `background_anatomy_suggestion` role.
5. Do not change Hub geometry or route placement.

### Delete / disable targets

- No permanent geometry deletion in W2B1.
- No legacy-system removal unless the audit reveals two visual owners producing the exact same presentation artifact.
- Any attenuation must preserve authored state and be presentation-only.

## 6. W2B1 acceptance

A W2B1 playthrough passes when:

1. In Scar/Guide, the Core/Guide and current local point of interaction can be identified without relying on the debug HUD.
2. The middle slice reads as at least three depth strata: immediate/local, supporting anatomy, distant Host.
3. Full-length cyan currents remain present but do not behave like a translucent screen overlay.
4. Hub foreground anatomy reads as framing/occlusion, not as the brightest or most opaque chamber layer.
5. Hub route territories and central comparison space remain readable.
6. Distant Host remains visible as scale/context but does not dominate the viewport.
7. No global scene brightening and no quest-arrow behavior is introduced.
8. No new world drawables are added; draw-call count should remain flat or lower.
9. W2A settled performance does not materially regress. Known Surface→Scar residual live-scene hitch is documented debt, not a W2B target.
10. Targeting, Pulse/Absorb/Stabilize, surface contact, route progression, and audio behavior regressions remain clean.

## 7. W2B follow-up ladder

### W2B2 — Pulse / Sonar Spatial Reveal

After the static hierarchy is readable on its own, use Pulse/Sonar as a short-lived spatial clarifier: nearby actionable Host response lifts; supporting/distant structures temporarily recede or contour; no waypoint or permanent highlight is created.

### W2B3 — Aperture Low-Light Readability

Apply the proven hierarchy rule to Aperture: preserve darkness and mood while restoring local silhouette, interaction contrast, and directional structure. Do not solve by raising the whole scene exposure.

### W2B4 — Region Signature / Regression Convergence

Verify that Surface Wake, Scar/Guide, Hub, Comb, and Aperture remain visually distinct while sharing the same hierarchy grammar. Only then lock W2B.

## 8. First implementation recommendation

Proceed with **HC-031W2B1 — Depth Hierarchy Foundation** as a small changed-files-only patch. Do not add a new general-purpose rendering architecture unless the existing owners cannot express the hierarchy directly. Prefer tuning existing authored opacity/emissive/intensity relationships and adding lightweight presentation metadata over creating new geometry or global post-processing.
