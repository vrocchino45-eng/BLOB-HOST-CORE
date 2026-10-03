# BLOB HC-031W2 telemetry evidence check

Source: BLOB_HC-031W1_cebca0a7-8099-4267-869e-d45b849f2ba2(2).json
Build: HC-031W1 / Stabilized Aim + Local Contact Proof
Authority: read_only_observer; gameplayAuthority=false
Duration: 742.987 seconds; events=4098; movementSamples=1428

## Targeting
- Stabilize+right-stick audit observations: 41
- Of those, local candidate observed: 4; candidate within reported assist range: 1
- Explicit redirectEvidencePresent audits: 0
- Successful redirect count: 0
- Redirect blocks: 0
- Macro/local suppressions: 78

### Local candidate while Stabilize+steering
- t=668.16s; finding=stabilize_macro_relationship_suppressed_local_context; candidate=gathering_ground_watcher_001; attention=gathering_ground_relay_b_001; relationship=none; candidateDistance=0.793; stick=0.405; dwellAge=0; redirectEvidencePresent=false

## Surface and movement
- Authoritative movement samples near mechanically eligible authored surfaces: 62
- Among those: stabilizeHeld=29; absorbHeld=14; nontrivial movement input=46
- Attachment-active samples: 0; attachment states=free
- Surface attachment events: 0
- Surface detachment events: 0
- Deliberate detachments: 0
- Reacquire unblocks: 0
- Maximum authoredSuctionSupportCount: 0

### Reproduction windows (mechanical eligibility is not actual contact)
- 418–422s:
  - 419.70s membrane_stable d=0.4 stabilize=true absorb=false attach=free
  - 420.22s membrane_stable d=0.073 stabilize=true absorb=false attach=free
  - 421.25s membrane_stable d=0.229 stabilize=false absorb=false attach=free
  - 421.75s membrane_stable d=0.37 stabilize=false absorb=false attach=free
- 599–604s:
  - 600.18s residue_weak d=0.037 stabilize=true absorb=false attach=free
  - 600.70s residue_weak d=0.461 stabilize=false absorb=false attach=free
  - 601.21s residue_weak d=0.1 stabilize=false absorb=false attach=free
  - 601.71s residue_weak d=0.153 stabilize=false absorb=false attach=free
- 666–670s:
  - 666.21s membrane_stable d=0.574 stabilize=true absorb=true attach=free
  - 666.74s membrane_stable d=0.529 stabilize=true absorb=true attach=free
  - 667.80s membrane_stable d=0.748 stabilize=true absorb=false attach=free
  - 668.31s membrane_stable d=0.514 stabilize=true absorb=false attach=free
- 676–681s:
  - 677.66s scar_brace d=0.273 stabilize=false absorb=false attach=free
  - 678.73s scar_brace d=0.711 stabilize=false absorb=false attach=free
  - 679.27s scar_brace d=0.241 stabilize=false absorb=false attach=free
  - 680.31s scar_brace d=0.419 stabilize=true absorb=false attach=free

## Continuity regression markers
- Ridge completion=1; territory openings=1; territory entries=1
- Gathering Ground completions=10; ongoing response cycles=6

## Evidence interpretation
- Zero redirect/attachment in telemetry means NOT PROVEN. Whether this represents an algorithm failure, an unmet precondition, or missing runtime-authority wiring requires reason-coded instrumentation and a controlled playtest.
- A mechanically eligible capability sample is only a diagnostic opportunity; do not count it as a successful physical seal.
- A single nearby local candidate during steering does not by itself prove enough valid dwell or an eligible existing relationship.
