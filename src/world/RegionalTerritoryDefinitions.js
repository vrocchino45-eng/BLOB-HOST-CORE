// C0E2 single source of truth for the twelve C0E1 exploratory sites.
const SPECS = Object.freeze({
  silt: { cell: 'CELL_SILT_PRESSURE_ROUTE_001', palette: [0x8c6943, 0xb68b52, 0xe1b980],
    sites: [
      { id: 'silt_porosity_shelf', name: 'Porosity Shelf', point: [-2.45, -0.72, -5.8], question: 'How does loosened matter settle?',
        flowReceiver: { id: 'silt_porosity_shelf_front', offset: [0, 0.18, 0.95], normal: [0, 0.36, 0.93],
          radius: 0.22, conductivity: 0.72, resistance: 0.31 } },
      { id: 'silt_catchment_bowl', name: 'Catchment Bowl', point: [2.65, -0.9, -10.45], question: 'Can pressure leave a persistent shape?' },
      { id: 'silt_deep_reservoir', name: 'Deep Reservoir', point: [-2.35, -0.6, -15.35], question: 'Which material returns after release?' }
    ] },
  vascular: { cell: 'CELL_VASCULAR_RHYTHM_ROUTE_001', palette: [0x468db4, 0x6dc2d0, 0xb0d7ef],
    sites: [
      { id: 'vascular_intake_branch', name: 'Intake Branch', point: [2.65, 0.35, -4.7], question: 'What pressure reaches the membrane?' },
      { id: 'vascular_exchange_fork', name: 'Exchange Fork', point: [-2.75, 0.42, -10.35], question: 'How is load redistributed?' },
      { id: 'vascular_return_capillary', name: 'Return Capillary', point: [2.75, -0.38, -17.25], question: 'How does the vessel recover?' }
    ] },
  grave: { cell: 'CELL_GRAVE_MEMORY_RESIDUE_BED_001', palette: [0x875871, 0xb18aa3, 0xd1abb8],
    sites: [
      { id: 'grave_first_imprint', name: 'First Imprint', point: [-3.65, -0.3, -5.15], question: 'Which disturbance is retained?' },
      { id: 'grave_contradiction_terrace', name: 'Contradiction Terrace', point: [3.55, -0.25, -10.75], question: 'Which histories resist alignment?' },
      { id: 'grave_inheritance_vault', name: 'Inheritance Vault', point: [-2.65, 0.26, -15.15], question: 'What persists on return?' }
    ] },
  hub: { cell: 'CELL_SIGNAL_CHORUS_NERVE_001', palette: [0x9c7647, 0x57a9c6, 0xae779d],
    sites: [
      { id: 'hub_silt_root', name: 'Sediment Root', point: [-3.7, -1.15, -5.15], question: 'Where did this material signal originate?' },
      { id: 'hub_vascular_root', name: 'Transmission Root', point: [0.35, 1.75, -7.0], question: 'What was applied, not merely observed?' },
      { id: 'hub_grave_root', name: 'Memory Root', point: [3.55, -0.62, -5.75], question: 'Which consequence can return?' }
    ] }
});

export const territoryDefinition = (kind) => SPECS[kind] ?? null;
