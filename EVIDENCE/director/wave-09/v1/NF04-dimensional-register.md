# NF04-C1 · Approved scoped dimensional relationships

NF02 revision 1 is approved for PI04 only. Lw is authored world length, Ts admitted simulation time, Mr experimental inertial mass and Q conserved inventory. SI length and mass factors remain unset. Q stays independent of Mr. Indexed reserve, hydraulic-looking Flow, render scales and fictional fields retain distinct owner semantics.

| Quantity and equation | Dimensions | Scope |
| --- | --- | --- |
| Position/displacement; v = dx/dt | Lw; Lw/Ts | One translated Silt-local rigid frame per mount. |
| a = dv/dt; F = ma; J = ∫F dt | Lw/Ts²; Mr·Lw/Ts²; Mr·Lw/Ts | Native spring/drag are already kinematic. The calibrated law here is only the isolated pair impulse. |
| p = mv; K = ½m(v·v) | Mr·Lw/Ts; Mr·Lw²/Ts² | Assert conservation across immediate contact; record native acceleration, drag and fixed response separately. |
| ρ = m/V | Mr/Lw³ | Requires independently validated physical volume and mechanical mass. |
| W = ∫F·dx; P = dW/dt | Mr·Lw²/Ts²; Mr·Lw²/Ts³ | Classical relation. Existing Core reserve index keeps its owner. |
| Pressure = normal force/area, stress = force/area | Mr/(Lw·Ts²) | A dimensionally valid law under a calibrated model. Existing F1 pressure remains an index. |
| Angle; angular rate; r×p; r×F | rad; rad/Ts; Mr·Lw²/Ts; Mr·Lw²/Ts² | Angular dynamics deferred. Equal dimensions do not collapse torque and energy. |
| Frequency; 2πf dt | cycles/Ts; phase in radians | Vascular timing stays tied to its authored cadence. |
| Linear damping exp(−d·t); continuum viscosity | d in Ts⁻¹; Mr/(Lw·Ts) | Native decay and viscosity indices retain their current roles. |

Use absolute plus relative 1e-12 as the contact-stage momentum/energy comparison tolerance in the scoped values. Use the existing native 0.025 Ts trajectory microstep and guarded catch-up boundaries. MP02 SI fields remain unset. No global physics constants or retuning follow from these relationships.

[Approved manifest](MP03-P1-admission.json) · [Validated dimensional relations](NF04-contract.test.mjs)
