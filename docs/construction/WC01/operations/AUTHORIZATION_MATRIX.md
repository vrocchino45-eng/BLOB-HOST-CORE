# Authorization checkpoints

This setup authorizes local documentation preparation only. Current source and GitHub state remain unchanged.

| Separate approval | Exact planned action |
|---|---|
| Baseline preparation | Approve original parent, 33-path overlay hash manifest and documentation scope, chosen publication branch, and public disclosure. Then run the isolated `git clone` and `git switch -c`, copy, explicit `git add -- @OverlayPaths` / `@DocPaths`, and two `git commit` commands in the [publication plan](BASELINE_PUBLICATION.md). |
| Baseline publication | Approve the resulting verified SHA and exact remote ref. Then run `git push origin "${Pinned}:refs/heads/$PublicationRef"`. |
| GitHub changes | Approve issue/PR titles, bodies, labels, base and heads before GitHub issue or PR creation. Approve label creation/assignment, rulesets, reviewer requests and Actions changes separately. Issue and PR drafts in this directory carry no publication authority. |
| Trade setup and dispatch | After verified publication, authorize `git fetch` and worktree creation for the named trades and SHA. Separately authorize each implementation or verification session and its eligible sub-scope. |
| Design and canon | Record authority before new canon, new gameplay-state ownership, or shared interface changes. Confirm producer and consumer agreement for shared interfaces. |
| Integration candidate | Approve exact passing PR SHAs and candidate destination before the coordinator admits, merges or pushes them. Agents cannot merge their work. |
| Authoritative promotion or release | Approve the exact human-tested candidate SHA and destination separately. Publishing playtest telemetry, builds, tags or releases requires separate artifact and public-disclosure approval. |

Read-only local inspection and live ref reads do not grant any of the permissions above.
