# HC-002ZB — Camera Occlusion + Final Lock Readout Polish

## Purpose

HC-002ZA made the right-stick camera usable, but playtest still showed the player core could be visually buried behind large translucent tissue forms. HC-002ZB improves readability without changing gameplay structure.

## Scope

```text
camera foreground tissue fade
player-core readability halo
camera auto-pullback bias
Bloom Residue complete/readout polish
placeholder pressure categorization
```

## Forbidden Scope

```text
no fifth cell
no new morph
no new ability
no combat
no dialogue tree
no HC-003 expansion implementation
```

## Camera Readability Rule

The camera remains player-tethered. The pass does not create a detached free camera. It only gives the player corrective orbit/tilt and automatically fades large tissue forms when they block the player-core sightline.

## Player Core Readability Rule

The player core gets a subtle in-world marker:

```text
soft halo
vertical glint
pulse-reactive opacity
```

This is not a HUD arrow. It should still feel organic and internal to the tissue space.

## Lock Readout Rule

When Bloom Residue is stable, the build should clearly show:

```text
Bloom Residue Loop: stable / complete 100%
Four-cell chain: lock candidate
```

## Placeholder Pressure Rule

Expired placeholders are now categorized rather than shown only as a raw count:

```text
visual-lock required
prototype accepted
```

This prevents visual placeholder warnings from looking like gameplay errors while still keeping replacement pressure visible.
