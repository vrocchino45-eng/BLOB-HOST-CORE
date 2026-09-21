# BLOB: HOST CORE — HC015N HOTFIX1

## Reproduced issue
The objective remains `COMPLETE_SIGNAL_PLAIN`, but once the player leaves the Signal Plain wake radius the world stops strongly identifying where the unfinished ecology is. Meanwhile future Aperture landmarks remain visible and can look like valid destinations.

## Root cause
- `SignalPlainEcologySystem` defines `encounterAwake` only within 15.5 units.
- Outside that radius, unread receptor route-guide markers fell to approximately 0.012 opacity.
- `ApertureFieldsArrivalSystem` used a fixed arrival-shelf-to-Signal guide line at roughly 0.055 opacity; it does not follow a player who has wandered elsewhere.
- Membrane Ridge and Gathering Ground remained visible as world landmarks before Signal Plain completion.

This created a priority inversion: the unfinished objective became quieter than locked future content.

## Fix
- Future Membrane Ridge / Gathering Ground landmarks are subdued until Signal Plain completion.
- Signal Plain gains stronger distance-based emissive priority while unfinished.
- When the player moves more than 17.5 units from unfinished Signal Plain, a subtle living return filament forms from the player's current area toward the Signal Plain organ.
- The filament disappears immediately after Signal Plain completion so HC015N Membrane Ridge continuation remains authoritative.
- Distant unread receptor markers remain faintly alive rather than nearly disappearing.

## Locked
No changes to Signal Plain interaction ranges, receptor count, Stabilize/Pulse completion, HC015N Membrane Ridge mechanic, movement bounds, targeting, progression, or controller mapping.
