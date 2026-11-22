# DESIGN_AND_CANON_REVIEW — WC01 v0.2

This is the gate between World Census / Gap Assessment and construction work-order release. It supplements baseline admission and all existing Trade, Experience and Integration inspections. It grants no implementation authorization.

## Review path

1. Register each gap by stable RFI ID and primary class: defect, presentation, missing gameplay, missing world meaning, missing canon, integration conflict, or verification gap. Split a gap when a verified correction and an unresolved design decision would otherwise share a disposition.
2. Record current implementation and owner, historical references, applicable blueprint authority and evidence quality. Source facts and measured behavior describe the as-built state. A human report without a matched trace remains an observation. Retired checkpoint behavior and compatible v1 material are distinct from binding current requirements.
3. Decide whether the proposed work restores an existing approved rule. If it changes player choice, repeatability, effects, state ownership, or canonical meaning, open or update an RFI and attach a design brief. Separate the least invasive correction or verification when it can stand alone.
4. For a design or canon decision, obtain explicit project/design or canon authority appropriate to the decision. Record the approver, approval reference, approved choice and exclusions, affected runtime IDs and interfaces, acceptance criteria, and date in the relevant region, entity, landmark or system blueprint. Link that record in the RFI. A trade or inspector cannot supply missing approval.
5. Freeze the approved specification. A construction-ready order must reference its gap IDs and decision record, owners, scope and locks, required evidence, and Trade, Experience and Integration gates. Issue it only after separate authorization to execute. Keep any unapproved options in the register.
6. On acceptance, update the as-built sheets and schedule against the same IDs. Record approved versus observed behavior, exact files and evidence, and open a discrepancy RFI for variance. Do not rewrite canon to match an accidental implementation.

## Dispositions

| Disposition | Release rule |
|---|---|
| Ready for construction | Existing approved specification or documented new approval, with evidence and dependencies satisfied. Still requires separate execution authorization. |
| Ready for independent verification | Evidence-gathering can proceed in isolation when authorized. Allows source, fixture and normal-route checks. Grants no authority to decide design, canon or gameplay changes. |
| Requires game design | An experience or behavior choice remains open. Attach alternatives and tradeoffs. Hold implementation. |
| Requires canon approval | A biological, narrative or historical claim needs designated approval. Keep source-confirmed facts and proposed interpretations separate. |
| Blocked by dependency | Record the specific upstream evidence, interface agreement or capability. Re-review when it arrives. |

Independent verified defect repairs can qualify without waiting for unrelated RFIs. A release may include only the qualifying sub-scope. Preserve the original scope checks, test parity, isolated copies, controller acceptance, historical refs and rollback rules.

## Evidence authority

Current behavior comes from the admitted snapshot and current owners. Current approved scope comes from B5-C3 and WC01 constraints and the applicable accepted feature checkpoints, including F1, C63 and T1-A. The available rebuild authority summary identifies the primary package. The full package is unavailable. Compatible HOST CORE v1 guides regional intent where consistent. Historical HC, LS1, C and CONNECTION records establish provenance and prior intent. Proposed lore remains proposed until explicitly approved.

[Authority record](../../../../src/core/HostCoreSourceAuthority.js) · [Compatible region grammar](../../../../reference_docs/HOST_CORE_Region_Grammar_v1.md) · [RFI register](DESIGN_RFI_REGISTER.md) · [Design briefs](DESIGN_BRIEFS.md) · [Inspection plan](INSPECTION_AND_ACCEPTANCE_PLAN.md)
