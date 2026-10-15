# LS1D1D2A — World Object Census (diagnostic only)

Apply these changed files over the **LS1D1D1-tested build** (do not replace with older main).

- F4: toggle read-only snapshot overlay.
- F5: while overlay is open, export full JSON census for review.
- Captures scene primitive groups, userData key examples, targeting suppression, registered attention candidates, legacy target, and Silt progression flags.
- Does **not** alter target registration, labels on objects, verb destinations, grip, movement, or progression.
- Grouped mesh owners are provisional names, not canonical entity IDs.

Test: open Silt, press F4, then F5; upload the JSON. Also repeat near the unlabeled Guide-like object. Verify F4 closes without visual leftovers.
