const SURFACE_CELL_ID = "CELL_MEMBRANE_NURSERY_001";
const GUIDE_CELL_ID = "CELL_SCAR_FLOW_FOLD_001";
const HUB_CELL_ID = "CELL_SIGNAL_CHORUS_NERVE_001";
const VASCULAR_CELL_ID = "CELL_VASCULAR_RHYTHM_ROUTE_001";
const SILT_CELL_ID = "CELL_SILT_PRESSURE_ROUTE_001";
const GRAVE_CELL_ID = "CELL_GRAVE_MEMORY_RESIDUE_BED_001";
const COMB_CELL_ID = "CELL_COMB_THRESHOLD_FILTER_001";
const APERTURE_CELL_ID = "CELL_APERTURE_FIELDS_ARRIVAL_001";

const NO_MOVEMENT_AUTHORITY = Object.freeze({
  flowModulationDepth: 0,
  minimumFlowScale: 1,
  maximumFlowScale: 1,
  minimumMoteSpeedScale: 1,
  maximumMoteSpeedScale: 1
});

const PRESENTATION_ONLY_AUTHORITY = Object.freeze({
  progression: false,
  objective: false,
  routeCompletion: false,
  inputTimingGate: false,
  sharedHostClock: true
});

// HC028F — every region already present in the active first-slice registry now
// speaks through the same World Composition grammar. Profiles describe how a
// place organizes time, matter and emphasis; they never own progression,
// movement, route completion, verb strength or input timing.
export const WORLD_COMPOSITION_PROFILES = Object.freeze({
  surface_aps_68_micro: Object.freeze({
    id: "surface_aps_68_micro",
    cellId: SURFACE_CELL_ID,
    region: "surface_wake",
    key: Object.freeze({
      id: "A-P-S",
      dominant: "absorb",
      secondary: "pulse",
      tertiary: "stabilize",
      order: Object.freeze(["absorb", "pulse", "stabilize"])
    }),
    meter: Object.freeze({
      beatsPerBar: 6,
      beatUnit: 8,
      barsPerHostCycle: 1,
      groupingLabel: "3+3",
      accentPattern: Object.freeze([1.0, 0.16, 0.12, 0.72, 0.18, 0.12]),
      movementAccentPattern: Object.freeze([0, 0, 0, 0, 0, 0]),
      functionPattern: Object.freeze(["absorb", "pulse", "stabilize", "absorb", "pulse", "stabilize"]),
      accentRolePattern: Object.freeze([
        "receive_nursery", "wake_expression", "settle_shell",
        "receive_nursery", "wake_expression", "settle_shell"
      ])
    }),
    octave: Object.freeze({ index: 0, label: "micro_local" }),
    movement: NO_MOVEMENT_AUTHORITY,
    physical: Object.freeze({
      law: "buoyant_nursery_exchange",
      matter: "living_suspension_membrane",
      force: "soft_receive_expand_settle",
      geometry: "breathing_pocket",
      ecology: "nursery_suspension",
      base: Object.freeze({ driftScale: 1.05, dampingScale: 0.96, clusteringScale: 1.04, settlingScale: 0.94, currentBiasScale: 1.0, fieldRadiusScale: 1.0 }),
      functionBias: Object.freeze({
        absorb: Object.freeze({ radial: -0.030, tangential: 0.006, vertical: -0.002, flow: 0.000, damping: 0.02, drift: -0.02, clustering: 0.08, settling: 0.02, current: 0.00, radius: -0.01 }),
        pulse: Object.freeze({ radial: 0.044, tangential: 0.010, vertical: 0.010, flow: 0.004, damping: -0.04, drift: 0.08, clustering: -0.02, settling: -0.04, current: 0.02, radius: 0.04 }),
        stabilize: Object.freeze({ radial: 0.000, tangential: 0.004, vertical: -0.004, flow: 0.000, damping: 0.12, drift: -0.06, clustering: 0.04, settling: 0.04, current: -0.02, radius: -0.02 })
      })
    }),
    audio: Object.freeze({
      enabled: true,
      baseFrequencyHz: 58,
      ratios: Object.freeze({ absorb: 1.0, pulse: 1.5, stabilize: 1.25 }),
      waveformByFunction: Object.freeze({ absorb: "sine", pulse: "triangle", stabilize: "sine" }),
      gainPattern: Object.freeze([0.78, 0.22, 0.14, 0.62, 0.24, 0.15]),
      durationPattern: Object.freeze([1.22, 0.62, 0.72, 1.05, 0.66, 0.78]),
      glidePattern: Object.freeze([0.94, 1.08, 0.98, 0.95, 1.06, 0.98]),
      voice: "nursery_exchange_bass"
    }),
    authority: PRESENTATION_ONLY_AUTHORITY
  }),

  guide_spa_44_micro: Object.freeze({
    id: "guide_spa_44_micro",
    cellId: GUIDE_CELL_ID,
    region: "guide_threshold",
    key: Object.freeze({
      id: "S-P-A",
      dominant: "stabilize",
      secondary: "pulse",
      tertiary: "absorb",
      order: Object.freeze(["stabilize", "pulse", "absorb"])
    }),
    meter: Object.freeze({
      beatsPerBar: 4,
      beatUnit: 4,
      barsPerHostCycle: 2,
      groupingLabel: "4",
      accentPattern: Object.freeze([1.0, 0.32, 0.68, 0.26]),
      movementAccentPattern: Object.freeze([0, 0, 0, 0]),
      functionPattern: Object.freeze(["stabilize", "pulse", "stabilize", "absorb"]),
      accentRolePattern: Object.freeze(["brace_direction", "send_intent", "hold_lane", "receive_reply"])
    }),
    octave: Object.freeze({ index: 0, label: "micro_local" }),
    movement: NO_MOVEMENT_AUTHORITY,
    physical: Object.freeze({
      law: "directional_threshold_alignment",
      matter: "pressurized_scar_signal",
      force: "brace_shear_reply",
      geometry: "directed_fold",
      ecology: "threshold_current",
      base: Object.freeze({ driftScale: 0.96, dampingScale: 1.04, clusteringScale: 0.96, settlingScale: 0.94, currentBiasScale: 1.08, fieldRadiusScale: 0.98 }),
      functionBias: Object.freeze({
        stabilize: Object.freeze({ radial: 0.000, tangential: 0.008, vertical: 0.000, flow: 0.004, damping: 0.14, drift: -0.08, clustering: 0.02, settling: 0.02, current: 0.02, radius: -0.02 }),
        pulse: Object.freeze({ radial: 0.018, tangential: 0.004, vertical: 0.002, flow: 0.034, damping: -0.03, drift: 0.03, clustering: -0.02, settling: -0.02, current: 0.12, radius: 0.01 }),
        absorb: Object.freeze({ radial: -0.018, tangential: -0.004, vertical: -0.002, flow: -0.012, damping: 0.04, drift: -0.02, clustering: 0.04, settling: 0.03, current: -0.04, radius: -0.01 })
      })
    }),
    audio: Object.freeze({
      enabled: true,
      baseFrequencyHz: 64,
      ratios: Object.freeze({ stabilize: 1.0, pulse: 1.5, absorb: 1.25 }),
      waveformByFunction: Object.freeze({ stabilize: "triangle", pulse: "triangle", absorb: "sine" }),
      gainPattern: Object.freeze([0.86, 0.40, 0.64, 0.34]),
      durationPattern: Object.freeze([0.88, 0.62, 0.82, 0.92]),
      glidePattern: Object.freeze([0.99, 1.08, 1.00, 0.92]),
      voice: "threshold_direction_bass"
    }),
    authority: PRESENTATION_ONLY_AUTHORITY
  }),

  hub_spa_64_micro: Object.freeze({
    id: "hub_spa_64_micro",
    cellId: HUB_CELL_ID,
    region: "hub_chamber",
    key: Object.freeze({
      id: "S-P-A",
      dominant: "stabilize",
      secondary: "pulse",
      tertiary: "absorb",
      order: Object.freeze(["stabilize", "pulse", "absorb"])
    }),
    meter: Object.freeze({
      beatsPerBar: 6,
      beatUnit: 4,
      barsPerHostCycle: 1,
      groupingLabel: "3+3",
      accentPattern: Object.freeze([1.0, 0.38, 0.54, 0.78, 0.36, 0.52]),
      movementAccentPattern: Object.freeze([0, 0, 0, 0, 0, 0]),
      functionPattern: Object.freeze(["stabilize", "pulse", "absorb", "stabilize", "pulse", "absorb"]),
      accentRolePattern: Object.freeze(["center_hold", "route_send", "route_receive", "center_hold", "route_send", "route_receive"])
    }),
    octave: Object.freeze({ index: 0, label: "micro_junction" }),
    movement: NO_MOVEMENT_AUTHORITY,
    physical: Object.freeze({
      law: "balanced_junction_orbit",
      matter: "signal_form_scar_junction",
      force: "center_orbit_exchange",
      geometry: "three_route_tonic",
      ecology: "junction_chorus",
      base: Object.freeze({ driftScale: 0.94, dampingScale: 1.03, clusteringScale: 1.08, settlingScale: 0.96, currentBiasScale: 1.0, fieldRadiusScale: 1.03 }),
      functionBias: Object.freeze({
        stabilize: Object.freeze({ radial: -0.006, tangential: 0.030, vertical: 0.000, flow: 0.000, damping: 0.10, drift: -0.04, clustering: 0.06, settling: 0.01, current: 0.00, radius: -0.01 }),
        pulse: Object.freeze({ radial: 0.026, tangential: 0.024, vertical: 0.004, flow: 0.006, damping: -0.03, drift: 0.04, clustering: -0.02, settling: -0.02, current: 0.04, radius: 0.02 }),
        absorb: Object.freeze({ radial: -0.026, tangential: 0.024, vertical: -0.003, flow: -0.004, damping: 0.02, drift: -0.02, clustering: 0.05, settling: 0.03, current: -0.02, radius: -0.01 })
      })
    }),
    audio: Object.freeze({
      enabled: true,
      baseFrequencyHz: 60,
      ratios: Object.freeze({ stabilize: 1.0, pulse: 1.5, absorb: 1.25 }),
      waveformByFunction: Object.freeze({ stabilize: "sine", pulse: "triangle", absorb: "sine" }),
      gainPattern: Object.freeze([0.70, 0.48, 0.48, 0.66, 0.46, 0.46]),
      durationPattern: Object.freeze([1.08, 0.74, 0.86, 1.02, 0.72, 0.84]),
      glidePattern: Object.freeze([0.99, 1.04, 0.95, 0.99, 1.04, 0.95]),
      voice: "junction_tonic_bass"
    }),
    authority: PRESENTATION_ONLY_AUTHORITY
  }),

  vascular_psa_44_micro: Object.freeze({
    id: "vascular_psa_44_micro",
    cellId: VASCULAR_CELL_ID,
    region: "vascular",
    key: Object.freeze({
      id: "P-S-A",
      dominant: "pulse",
      secondary: "stabilize",
      tertiary: "absorb",
      order: Object.freeze(["pulse", "stabilize", "absorb"])
    }),
    meter: Object.freeze({
      beatsPerBar: 4,
      beatUnit: 4,
      barsPerHostCycle: 2,
      groupingLabel: "4",
      accentPattern: Object.freeze([1.0, 0.28, 0.64, 0.22]),
      movementAccentPattern: Object.freeze([1.0, 0.42, 0.68, 0.46]),
      functionPattern: Object.freeze(["pulse", "stabilize", "absorb", "stabilize"]),
      accentRolePattern: Object.freeze(["transmit_downbeat", "catch_hold", "receive_draw", "settle_prepare"])
    }),
    octave: Object.freeze({ index: 0, label: "micro_local" }),
    movement: Object.freeze({
      flowModulationDepth: 0.06,
      minimumFlowScale: 0.96,
      maximumFlowScale: 1.06,
      minimumMoteSpeedScale: 0.92,
      maximumMoteSpeedScale: 1.10
    }),
    physical: Object.freeze({
      law: "laminar_transmission",
      matter: "vascular_suspension",
      force: "transmit_catch_receive_settle",
      geometry: "forward_vessel",
      ecology: "current_riders",
      base: Object.freeze({ driftScale: 1.04, dampingScale: 0.96, clusteringScale: 0.94, settlingScale: 0.90, currentBiasScale: 1.08, fieldRadiusScale: 1.0 }),
      functionBias: Object.freeze({
        pulse: Object.freeze({ radial: 0.018, tangential: 0.000, vertical: 0.002, flow: 0.030, damping: -0.04, drift: 0.06, clustering: -0.03, settling: -0.04, current: 0.12, radius: 0.01 }),
        stabilize: Object.freeze({ radial: 0.000, tangential: 0.006, vertical: 0.000, flow: 0.004, damping: 0.10, drift: -0.05, clustering: 0.02, settling: 0.02, current: -0.02, radius: -0.01 }),
        absorb: Object.freeze({ radial: -0.020, tangential: 0.000, vertical: -0.002, flow: -0.010, damping: 0.02, drift: -0.01, clustering: 0.04, settling: 0.02, current: -0.06, radius: -0.01 })
      })
    }),
    audio: Object.freeze({
      enabled: true,
      baseFrequencyHz: 72,
      ratios: Object.freeze({ pulse: 1.5, stabilize: 1.0, absorb: 1.25 }),
      waveformByFunction: Object.freeze({ pulse: "triangle", stabilize: "sine", absorb: "sine" }),
      gainPattern: Object.freeze([1.0, 0.55, 0.78, 0.40]),
      durationPattern: Object.freeze([1.08, 0.72, 1.18, 0.64]),
      glidePattern: Object.freeze([1.05, 0.99, 0.91, 0.98]),
      voice: "transmission_pulse"
    }),
    authority: PRESENTATION_ONLY_AUTHORITY
  }),

  silt_asp_34_micro: Object.freeze({
    id: "silt_asp_34_micro",
    cellId: SILT_CELL_ID,
    region: "silt",
    key: Object.freeze({
      id: "A-S-P",
      dominant: "absorb",
      secondary: "stabilize",
      tertiary: "pulse",
      order: Object.freeze(["absorb", "stabilize", "pulse"])
    }),
    meter: Object.freeze({
      beatsPerBar: 3,
      beatUnit: 4,
      barsPerHostCycle: 2,
      groupingLabel: "3",
      accentPattern: Object.freeze([1.0, 0.34, 0.66]),
      movementAccentPattern: Object.freeze([0, 0, 0]),
      functionPattern: Object.freeze(["absorb", "stabilize", "pulse"]),
      accentRolePattern: Object.freeze(["gather_weight", "brace_hold", "pressure_read_release"])
    }),
    octave: Object.freeze({ index: 0, label: "micro_local" }),
    movement: NO_MOVEMENT_AUTHORITY,
    physical: Object.freeze({
      law: "compression_accumulation_release",
      matter: "dense_silt_particulate",
      force: "gather_brace_release",
      geometry: "compressed_burrow",
      ecology: "settling_grains",
      base: Object.freeze({ driftScale: 0.92, dampingScale: 1.08, clusteringScale: 1.10, settlingScale: 1.12, currentBiasScale: 0.94, fieldRadiusScale: 0.96 }),
      functionBias: Object.freeze({
        absorb: Object.freeze({ radial: -0.046, tangential: 0.002, vertical: -0.010, flow: -0.004, damping: 0.04, drift: -0.06, clustering: 0.14, settling: 0.14, current: -0.04, radius: -0.04 }),
        stabilize: Object.freeze({ radial: -0.010, tangential: 0.004, vertical: -0.006, flow: 0.000, damping: 0.14, drift: -0.08, clustering: 0.08, settling: 0.08, current: -0.04, radius: -0.03 }),
        pulse: Object.freeze({ radial: 0.038, tangential: 0.004, vertical: 0.008, flow: 0.012, damping: -0.06, drift: 0.08, clustering: -0.08, settling: -0.10, current: 0.08, radius: 0.05 })
      })
    }),
    audio: Object.freeze({
      enabled: true,
      baseFrequencyHz: 52,
      ratios: Object.freeze({ absorb: 1.0, stabilize: 1.125, pulse: 1.5 }),
      waveformByFunction: Object.freeze({ absorb: "sine", stabilize: "triangle", pulse: "triangle" }),
      gainPattern: Object.freeze([1.0, 0.44, 0.74]),
      durationPattern: Object.freeze([1.34, 0.92, 0.70]),
      glidePattern: Object.freeze([0.88, 0.99, 1.12]),
      voice: "pressure_bass_triplet"
    }),
    authority: PRESENTATION_ONLY_AUTHORITY
  }),

  grave_sap_128_micro: Object.freeze({
    id: "grave_sap_128_micro",
    cellId: GRAVE_CELL_ID,
    region: "grave",
    key: Object.freeze({
      id: "S-A-P",
      dominant: "stabilize",
      secondary: "absorb",
      tertiary: "pulse",
      order: Object.freeze(["stabilize", "absorb", "pulse"])
    }),
    meter: Object.freeze({
      beatsPerBar: 12,
      beatUnit: 8,
      barsPerHostCycle: 1,
      groupingLabel: "3+3+3+3",
      accentPattern: Object.freeze([1.0, 0.16, 0.10, 0.62, 0.15, 0.10, 0.78, 0.17, 0.11, 0.46, 0.14, 0.09]),
      movementAccentPattern: Object.freeze([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
      functionPattern: Object.freeze([
        "stabilize", "stabilize", "stabilize",
        "absorb", "absorb", "absorb",
        "pulse", "pulse", "pulse",
        "stabilize", "stabilize", "stabilize"
      ]),
      accentRolePattern: Object.freeze([
        "memory_hold", "memory_echo", "memory_echo",
        "memory_draw", "memory_echo", "memory_echo",
        "memory_return", "memory_echo", "memory_echo",
        "memory_settle", "memory_echo", "memory_echo"
      ])
    }),
    octave: Object.freeze({ index: 0, label: "micro_local" }),
    movement: NO_MOVEMENT_AUTHORITY,
    physical: Object.freeze({
      law: "retained_memory_recoil",
      matter: "scar_residue_memory",
      force: "hold_draw_return_settle",
      geometry: "residue_bed",
      ecology: "echo_motes",
      base: Object.freeze({ driftScale: 0.88, dampingScale: 1.14, clusteringScale: 1.08, settlingScale: 1.10, currentBiasScale: 0.88, fieldRadiusScale: 0.96 }),
      functionBias: Object.freeze({
        stabilize: Object.freeze({ radial: -0.008, tangential: 0.006, vertical: -0.008, flow: -0.002, damping: 0.16, drift: -0.10, clustering: 0.08, settling: 0.10, current: -0.08, radius: -0.03 }),
        absorb: Object.freeze({ radial: -0.030, tangential: 0.004, vertical: -0.010, flow: -0.004, damping: 0.08, drift: -0.06, clustering: 0.10, settling: 0.12, current: -0.06, radius: -0.03 }),
        pulse: Object.freeze({ radial: 0.026, tangential: -0.006, vertical: 0.004, flow: 0.004, damping: -0.02, drift: 0.02, clustering: -0.02, settling: -0.02, current: 0.02, radius: 0.02 })
      })
    }),
    audio: Object.freeze({
      enabled: true,
      baseFrequencyHz: 44,
      ratios: Object.freeze({ stabilize: 1.0, absorb: 1.25, pulse: 1.5 }),
      waveformByFunction: Object.freeze({ stabilize: "sine", absorb: "sine", pulse: "triangle" }),
      gainPattern: Object.freeze([1.0, 0.18, 0.12, 0.70, 0.18, 0.12, 0.82, 0.20, 0.13, 0.50, 0.16, 0.10]),
      durationPattern: Object.freeze([1.42, 0.48, 0.42, 1.08, 0.48, 0.42, 0.92, 0.48, 0.42, 1.20, 0.48, 0.42]),
      glidePattern: Object.freeze([0.98, 0.98, 0.98, 0.90, 0.90, 0.90, 1.10, 1.10, 1.10, 0.96, 0.96, 0.96]),
      voice: "compound_memory_bass"
    }),
    authority: PRESENTATION_ONLY_AUTHORITY
  }),

  comb_sap_68_micro: Object.freeze({
    id: "comb_sap_68_micro",
    cellId: COMB_CELL_ID,
    region: "comb_threshold",
    key: Object.freeze({
      id: "S-A-P",
      dominant: "stabilize",
      secondary: "absorb",
      tertiary: "pulse",
      order: Object.freeze(["stabilize", "absorb", "pulse"])
    }),
    meter: Object.freeze({
      beatsPerBar: 6,
      beatUnit: 8,
      barsPerHostCycle: 1,
      groupingLabel: "3+3",
      accentPattern: Object.freeze([1.0, 0.18, 0.36, 0.72, 0.16, 0.34]),
      movementAccentPattern: Object.freeze([0, 0, 0, 0, 0, 0]),
      functionPattern: Object.freeze(["stabilize", "absorb", "pulse", "stabilize", "absorb", "pulse"]),
      accentRolePattern: Object.freeze(["align_filter", "take_sample", "reject_release", "align_filter", "take_sample", "pass_release"])
    }),
    octave: Object.freeze({ index: 0, label: "micro_threshold" }),
    movement: NO_MOVEMENT_AUTHORITY,
    physical: Object.freeze({
      law: "sorting_filter_bands",
      matter: "scar_signal_residue_filter",
      force: "align_sort_release",
      geometry: "comb_lamellae",
      ecology: "sorting_grains",
      base: Object.freeze({ driftScale: 0.90, dampingScale: 1.10, clusteringScale: 1.14, settlingScale: 1.06, currentBiasScale: 0.98, fieldRadiusScale: 0.98 }),
      functionBias: Object.freeze({
        stabilize: Object.freeze({ radial: 0.000, tangential: 0.020, vertical: -0.004, flow: 0.000, damping: 0.14, drift: -0.08, clustering: 0.12, settling: 0.08, current: -0.02, radius: -0.02 }),
        absorb: Object.freeze({ radial: -0.020, tangential: -0.018, vertical: -0.006, flow: -0.002, damping: 0.06, drift: -0.04, clustering: 0.10, settling: 0.08, current: -0.02, radius: -0.02 }),
        pulse: Object.freeze({ radial: 0.024, tangential: 0.024, vertical: 0.004, flow: 0.010, damping: -0.04, drift: 0.05, clustering: -0.06, settling: -0.05, current: 0.06, radius: 0.03 })
      })
    }),
    audio: Object.freeze({
      enabled: true,
      baseFrequencyHz: 56,
      ratios: Object.freeze({ stabilize: 1.0, absorb: 1.25, pulse: 1.5 }),
      waveformByFunction: Object.freeze({ stabilize: "triangle", absorb: "sine", pulse: "triangle" }),
      gainPattern: Object.freeze([0.82, 0.24, 0.44, 0.68, 0.22, 0.42]),
      durationPattern: Object.freeze([0.90, 0.66, 0.58, 0.84, 0.64, 0.56]),
      glidePattern: Object.freeze([0.99, 0.92, 1.10, 0.99, 0.92, 1.08]),
      voice: "filter_sort_bass"
    }),
    authority: PRESENTATION_ONLY_AUTHORITY
  }),

  aperture_pas_128_field: Object.freeze({
    id: "aperture_pas_128_field",
    cellId: APERTURE_CELL_ID,
    region: "aperture_fields",
    key: Object.freeze({
      id: "P-A-S",
      dominant: "pulse",
      secondary: "absorb",
      tertiary: "stabilize",
      order: Object.freeze(["pulse", "absorb", "stabilize"])
    }),
    meter: Object.freeze({
      beatsPerBar: 12,
      beatUnit: 8,
      barsPerHostCycle: 1,
      groupingLabel: "3+3+3+3",
      accentPattern: Object.freeze([0.92, 0.14, 0.10, 0.54, 0.14, 0.10, 0.72, 0.15, 0.10, 0.42, 0.13, 0.09]),
      movementAccentPattern: Object.freeze([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
      functionPattern: Object.freeze([
        "pulse", "pulse", "pulse",
        "absorb", "absorb", "absorb",
        "stabilize", "stabilize", "stabilize",
        "pulse", "absorb", "stabilize"
      ]),
      accentRolePattern: Object.freeze([
        "field_open", "field_air", "field_air",
        "field_receive", "field_air", "field_air",
        "field_cohere", "field_air", "field_air",
        "field_exchange", "field_exchange", "field_exchange"
      ])
    }),
    octave: Object.freeze({ index: 1, label: "meso_field" }),
    movement: NO_MOVEMENT_AUTHORITY,
    physical: Object.freeze({
      law: "decompression_field_exchange",
      matter: "open_membrane_signal_field",
      force: "expand_receive_cohere",
      geometry: "arrival_shelf_open_volume",
      ecology: "field_suspension",
      base: Object.freeze({ driftScale: 1.10, dampingScale: 0.92, clusteringScale: 0.92, settlingScale: 0.88, currentBiasScale: 1.06, fieldRadiusScale: 1.10 }),
      functionBias: Object.freeze({
        pulse: Object.freeze({ radial: 0.056, tangential: 0.008, vertical: 0.012, flow: 0.012, damping: -0.08, drift: 0.12, clustering: -0.08, settling: -0.08, current: 0.08, radius: 0.08 }),
        absorb: Object.freeze({ radial: -0.026, tangential: 0.006, vertical: -0.004, flow: -0.004, damping: 0.02, drift: -0.02, clustering: 0.06, settling: 0.02, current: -0.02, radius: -0.02 }),
        stabilize: Object.freeze({ radial: 0.000, tangential: 0.014, vertical: 0.002, flow: 0.000, damping: 0.10, drift: -0.05, clustering: 0.02, settling: 0.02, current: -0.02, radius: 0.00 })
      })
    }),
    audio: Object.freeze({
      enabled: true,
      baseFrequencyHz: 68,
      ratios: Object.freeze({ pulse: 1.5, absorb: 1.25, stabilize: 1.0 }),
      waveformByFunction: Object.freeze({ pulse: "triangle", absorb: "sine", stabilize: "sine" }),
      gainPattern: Object.freeze([0.78, 0.14, 0.10, 0.48, 0.14, 0.10, 0.62, 0.15, 0.10, 0.38, 0.20, 0.18]),
      durationPattern: Object.freeze([1.04, 0.44, 0.40, 0.88, 0.44, 0.40, 0.96, 0.44, 0.40, 0.82, 0.68, 0.72]),
      glidePattern: Object.freeze([1.06, 1.03, 1.01, 0.94, 0.95, 0.96, 0.99, 0.99, 0.99, 1.04, 0.96, 0.99]),
      voice: "open_field_exchange_bass"
    }),
    authority: PRESENTATION_ONLY_AUTHORITY
  })
});

const PROFILE_BY_CELL = new Map(
  Object.values(WORLD_COMPOSITION_PROFILES).map((profile) => [profile.cellId, profile])
);

export function resolveWorldCompositionProfile(activeCellId) {
  return PROFILE_BY_CELL.get(activeCellId) ?? null;
}
