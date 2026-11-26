# FL-N01 Dimensional register and reference laws

Provisional mechanical base dimensions are inertial mass **Mr**, world length **Lw**, and admitted simulation time **Ts**. **E = Mr·Lw²/Ts²**. The proposed independent coordinate **qF** labels signed field transfer or stored field quantity in an analytical model. Material inventory **Q** remains separate. Whether qF is a conserved local coordinate, quantized, or represented by a physical carrier is unresolved. SI crosswalks remain unset.

| Candidate quantity | Symbol | Dimension | Meaning in this reference |
| --- | --- | --- | --- |
| Stored or transferred quantity | qF | qF | Signed coordinate with a specified port orientation. |
| Current | I_F | qF/Ts | Signed transfer rate. Throughput integrates the magnitude and carries no directional sign. |
| Potential | Φ_F | E/qF | Conjugate exchange cost per qF. Difference determines passive linear branch direction. |
| Power | P_F | E/Ts | Energy transfer or dissipation rate with an accounted boundary. |
| Resistance | R_F | E·Ts/qF² | Positive passive branch parameter in the linear reference. |
| Conductance | G_F | qF²/(E·Ts) | Reciprocal of positive finite R_F. An open pathway has zero conductance. |
| Capacitance | C_F | qF²/E | Linear storage slope qF/Φ_F in a provisional storage fixture. |
| Inductance | L_F | E·Ts²/qF² | Candidate coefficient of current-rate response with quadratic storage in an idealized model. |
| Frequency | f_F | 1/Ts | Cycles per admitted time. |
| Phase | θ_F | dimensionless angular coordinate | Requires a reference and, for sequence, distinct phase identities. |

## Reference laws and controls

Use fixed finite port potentials over each admitted interval, positive finite linear resistance, bounded current, a declared orientation, and quasi-static branches. The reference evaluates **I_F = ΔΦ_F / R_F**, **P_branch = ΔΦ_F I_F**, and integrates **E_branch = ∫ P_branch dTs**. Source debit work Φ_A ΔqF, receiver credit work Φ_B ΔqF, and branch dissipation close as source work = receiver work + loss. At reversed direction the signs of the fixed-port works exchange their debit/credit roles. Dissipation stays nonnegative. Receipt or performance indices have no role in this derivation.

In a storage-free series chain current is common and resistances add. Parallel branches share ΔΦ and conductances add. At a junction with declared storage, incoming signed current sum equals its current storage rate. For a fixed positive linear capacitance the stored energy reference is qF²/(2 C_F), evaluated before and after within a finite capacity. A coupled charging model must fund that change from the specific work supplied and count losses. An open path reports zero transfer. Zero resistance, nonfinite inputs, negative time, over-capacity storage and overflow fail closed. A drop of zero means no passive branch current. Inductance is a dimensional reference here, with no dynamic solver or topology simulation.

Test comparison tolerance is 1e-10 times the greater of 1 and the target magnitude in the fixture's own units. That absolute floor is a reference tolerance. It carries no claim about runtime precision, measurement accuracy or minimum transfers.

## Alternatives

A bounded energy-port model can measure signed power and work without qF. Prefer it if a first experiment only needs power allocation and energy balance. It cannot by itself justify branch current conservation or independent storage coordinates. A shared-field interface could instead publish energy flux plus local field amplitude/phase and a divergence/boundary law. That would require admitted field variables and causal propagation. The qF analogue is useful because it keeps transfer rate, effort, energy, quantity in storage and cumulative throughput distinct, but it remains a candidate. Do not convert the existing Shelf fields using these relationships.

[Analytical implementation](FL-N01-reference.mjs) · [Tests](FL-N01-reference.test.mjs) · [Results](FL-N01.tap) · [Universal blueprint](https://github.com/vrocchino45-eng/BLOB-HOST-CORE/blob/dd77f2d813b252e2cbb5f88749d2faaa8e230075/docs/architecture/universal/BLOB_Universal_Physics_and_Organization_Blueprint_v1.md)
