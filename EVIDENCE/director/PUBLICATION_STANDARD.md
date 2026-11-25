# Director evidence publication standard · v1

Use this checklist for subsequent BLOB development waves. Record the accepted build, parent, exact patch/data hashes and authorized evidence scope before remote writes. Evidence and gameplay approval have separate gates.

| Level | Location and contents |
| --- | --- |
| Director review | Versioned GitHub index, summary, measured results, actual visuals and final release media. Label staging, silent capture, misalignment and Experience status. |
| Engineering verification | Versioned GitHub reports, disclosure-filtered telemetry, scenario definitions, test verdicts, exact candidate patch and manifests, architecture and coordination. Use GitHub URLs or checked relative paths. |
| Full archive | E: mirror of source sessions, capture attempts, diagnostics and generated outputs. Give each archive a logical ID, member paths, sizes and SHA-256 hashes. Keep the physical directory map local. |

1. Verify the exact accepted parent, remote inventory and destination ref. Preserve existing gameplay branches, checkpoints and original checkout.
2. Use a new immutable wave/revision directory and an explicitly evidence-named release tag. Upload only the review exports as release assets. Keep candidate approval and merge authorization separate.
3. Review data and actual media for disclosure. Keep credentials, personal identifiers, local profiles, device/session metadata, dependency caches, absolute paths and full production distributions out of Git. Verify exact patch and asset bytes after sanitizing surrounding metadata. Use a project no-reply commit identity.
4. Check paths, ancestry and content. Fetch a fresh checkout and verify GitHub downloads against expected checksums. Preserve the public index and private local archive.
5. Release asset availability lasts while repository access and release assets are retained. Workflow diagnostics have configured expiry and access restrictions. For public repos GitHub supports up to 90 days of Actions retention. Downloading workflow artifacts requires signed-in repository read access. [Retention](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/enabling-features-for-your-repository/managing-github-actions-settings-for-a-repository) · [Artifact access](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/download-workflow-artifacts)

## Capture classifications

- **Mechanical verification** requires native owner samples, action and acceptance identities, invariants and the recorded simulation-step partition.
- **Visual review** requires actual frames, consistent presentation, and verified capture-to-PTS references. Report renderer, frame intervals, simulation advancement, time discarded, capture overhead and sync error. Keep missing coverage explicit.
- **Real-time Experience review** requires representative wall/simulation correspondence, actual player input and observation. Record degraded graphics, timing, capture and audio. Keep elapsed times as observed.

Apply [recording profiles](presentation-profile.v1.json) to the capture observer or offline edit. Preserve ordinary HUD settings, camera behavior and simulation timing.

## Windows storage

Check C: and E: capacity before clones, builds and exports. Prefer E: for isolated source, Node dependency directories, installable browser and encoder caches, transient profiles, Vite caches, test fixtures, recordings and archives. Set TEMP, TMP, npm cache and Playwright cache in the relevant process. Leave global defaults and existing files in place. Document unavoidable system and installed-app usage on C: and every verified override.
