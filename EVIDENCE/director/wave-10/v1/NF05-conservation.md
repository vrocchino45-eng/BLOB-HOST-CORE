# NF05-C1 · Conservation accounting contract

The admitted scope is the NF02 revision 1 dimensional system, NF04 approved-scope checks, and the two identities in the exact MP03 admission. SI conversions are unset. Q, Mr and normalized indices retain separate meanings.

| Account | Unit and closure | Owner and witness |
| --- | --- | --- |
| Silt inventory | Q. Eight units across all admitted custody categories. Neither pair impulse nor settlement creates inventory. | `SiltLivingMaterialCycle` and the route material identity owner. Compare before/after inventory, identity, generation and custody. |
| Experimental inertial mass | Mr. Fixture parameters 1:1 or 1:3 for two eligible identities only. Fixed for a trial. | `src/contact/siltPairAdmission.json` and `SiltTrajectoryMemory.advancePair`. |
| Contact momentum | Mr·Lw/Ts. Vector sum immediately before and after one atomic contact, normal impulse equal and opposite, tangential components unchanged. | `SiltPairMomentum`, `SiltTrajectoryMemory`; compare measured incoming and outgoing vectors. |
| Mechanical kinetic energy | Mr·Lw²/Ts². Compute half mass times squared speed with the same inertial frame at contact. | Pair contact event fields `kineticEnergyBefore`, `kineticEnergyAfter`. |
| Native drive, drag, and recovery | Incoming and before-native velocity define an aggregate impulse and change in kinetic energy for observed stages. Source-independent forces and calibrated work contributions remain unresolved. | Existing trajectory integrator. The fixed surface is an external contact. Keep stages separate when comparing momentum. |
| Contact-stage dissipation | Mr·Lw²/Ts². Positive loss equals kinetic energy before minus after for admitted e = 0; compare against ½ reduced mass × incoming normal relative speed squared. | `kineticEnergyLost` in the pair event. Dissipation is recorded mechanically. There is no admitted transfer to heat, reserve, or transformed material. |
| Core reserve | Normalized operational capacity. | `CoreRadialPerformanceSystem` and existing resource settlement. No contact-energy conversion exists. |
| Flow settlement | Receiver-confirmed current, pressure, resistance and normalized reserve debit on the same accepted action. | `CoreFlowSystem`, `RegionalTerritoryExpansion.acceptFlow` and `SiltFlowContract`. Separate receiver settlement and retained Shelf imprint from Q and mechanical energy. |
| Organization and history | Semantic identity, generation and provenance fields. | `HostConnectionReceiptLedger`, route and session owners. History can be copied or expired without altering Q. |

At a valid contact the scalar normal impulse has dimension Mr·Lw/Ts and `v_after = v_before ± j*n/m`. Dot products with a unit normal preserve velocity units. `Δp_native = Σm(v_in−v_preNative)` and `ΔK_native = Σ½m(|v_in|²−|v_preNative|²)` are stage observations. They cannot identify force-by-force work or a total thermodynamic balance. Never sum overlapping timing or energy witnesses as separate accounts. Test absolute numerical residuals at 1e−12 for these measured trials. Saturated or unsupported results are rejected as a pair before any contact commitment.

Mechanical scope excludes heat, thermodynamic closure, permanent mass assignments, and a universal conservation owner. Current runtime keeps actor resource settlement and Host memory under their existing authoritative systems.
