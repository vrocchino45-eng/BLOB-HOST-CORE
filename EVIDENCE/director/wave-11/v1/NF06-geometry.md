# NF06-C1 · Geometry and restitution contract

Scope is the admitted two-body Silt experiment in the native rigid route frame. NF02 defines dimensional namespaces. NF04 keeps SI length and mass unset and separates frame representation and quantity Q. NF05 defines contact-stage bookkeeping and separates external force stages.

## Geometry ownership

| Term | Definition and witness |
| --- | --- |
| Physical center | State point advanced by the trajectory owner. |
| Center of mass | Mass-weighted position of the underlying body. Its admitted point-body approximation equals the proxy center for this fixture only. |
| Geometric center | Center of a specified solid under a stated geometric definition. An occupied-volume centroid and bounds midpoint can differ. |
| Collision proxy center | Center of the authored sphere used for contact. Reference route coordinates and translation of its state must be explicit. |
| Visual origin | Scene node pivot before local geometry, parent transforms and procedural pose. |
| Bounding volume | Conservative shape enclosing a declared proxy or visual vertex set. A bounds overlap can exist without physical penetration. |
| Physical occupied volume | Volume of an admitted material geometry. Collision-proxy volume and decorative mesh volume give no intrinsic volume calibration. |
| Contact surface | Boundary tested by the contact solver. |
| Interaction envelope | Existing targeting, grip and actuation eligibility around an identity. |
| Field influence envelope | Region where an admitted field law applies. No new field is admitted here. |

## Frame and transformation register

Object-local points pass through the owning scene parent's exact transform. A Core-local frame applies to Core-owned points. A Silt grain is region-local through its route root. Region-local points enter Host-local coordinates through an authored transform when defined, then reach world coordinates through the Host or mounted scene transform. Preserve Host, cell, mount, generation and sample step at coordinate joins.

Use homogeneous position `(x,y,z,1)` with the order `M_world←host M_host←region M_region←object` where all those frames exist. Direction vectors use homogeneous w=0. Normals use the inverse transpose of the linear transform and are normalized. This scoped pair admits only its pinned rigid frame, with translation and allowed existing authored transform checks unchanged. A physical length changes under physical scaling. Presentation scaling affects visible coordinates and camera magnification changes projection. Use `M_projection M_view p_world`, then divide xyz by clip w and map normalized device coordinates into the viewport. A small screen-space separation cannot establish proxy ingress. Do not project points with zero or invalid clip w.

Length is Lw, area Lw², occupied volume Lw³, reference inertial mass Mr, velocity Lw/Ts, momentum Mr·Lw/Ts, energy Mr·Lw²/Ts². SI length and mass conversion remain unset. Q is inventory. Restitution is dimensionless.

## Contact accounting

With normal n from A to B, signed incoming normal relative speed is `v_n=(v_B-v_A)·n<0`. Restitution is post-contact normal separation speed divided by incoming approach speed, `e=v'_n/(-v_n)`. The scalar impulse is `J=(1+e)(-v_n)/(1/m_A+1/m_B)`. Apply `-Jn` to A and `+Jn` to B atomically. Tangential velocity is preserved. If either velocity violates the existing owner speed limit, reject both. Loss is `½ μ (1-e²) v_n²` with reduced mass `μ=m_A m_B/(m_A+m_B)`. It remains mechanical dissipation. External native drive and drag appear outside this instantaneous account. Relate their contributions to actual observed pre-native and incoming velocities.

| Masses Mr | e | Outgoing normal Lw/Ts for incoming 1:0 | Energy after Mr·Lw²/Ts² | Loss |
| --- | ---: | --- | ---: | ---: |
| 1:1 | 0 | 0.5:0.5 | 0.25 | 0.25 |
| 1:1 | 0.5 | 0.25:0.75 | 0.3125 | 0.1875 |
| 1:1 | 1 | 0:1 | 0.5 | 0 |
| 1:3 | 0 | 0.25:0.25 | 0.125 | 0.375 |
| 1:3 | 0.5 | −0.125:0.375 | 0.21875 | 0.28125 |
| 1:3 | 1 | −0.5:0.5 | 0.5 | 0 |

Restitution controls an admitted instantaneous normal response. Elastic modulus, stiffness, compliance and damping describe distinct material or time-dependent laws. Plastic deformation changes retained shape. Friction concerns tangent motion, adhesion concerns separative load and damage concerns structural state. None follows from e in this contract.

Tolerance uses `|a-b| ≤ 1e−12(1+max(|a|,|b|))` for bounded computed impulse witnesses, with exact equality for identities, receipt counts, admission keys and forbidden output changes. Proxy ingress and fixed-surface arbitration keep their established tolerances. Validate finite input and both outputs before touching owner state. This contract introduces no runtime constant or broad material law.
