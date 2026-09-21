export const CRAWLABLE_SURFACE_PROFILES = Object.freeze({
  membrane_stable: Object.freeze({
    id: "membrane_stable",
    materialFamily: "membrane",
    adhesion: 0.84,
    loadTolerance: 0.74,
    compliance: 0.46,
    verbTransmission: Object.freeze({ pulse: 0.64, absorb: 0.72, stabilize: 0.82 }),
    regionalRole: "stable_contact_field",
    description: "living membrane that accepts a broad, forgiving suction seal"
  }),
  scar_brace: Object.freeze({
    id: "scar_brace",
    materialFamily: "scar",
    adhesion: 0.96,
    loadTolerance: 0.96,
    compliance: 0.18,
    verbTransmission: Object.freeze({ pulse: 0.94, absorb: 0.62, stabilize: 0.76 }),
    regionalRole: "high_load_brace",
    description: "dense scar anatomy that strongly resists recoil and concentrates load"
  }),
  soft_tissue: Object.freeze({
    id: "soft_tissue",
    materialFamily: "living_tissue",
    adhesion: 0.78,
    loadTolerance: 0.56,
    compliance: 0.82,
    verbTransmission: Object.freeze({ pulse: 0.54, absorb: 0.70, stabilize: 0.88 }),
    regionalRole: "deforming_contact_field",
    description: "soft Host tissue that grips well but yields visibly under load"
  }),
  residue_weak: Object.freeze({
    id: "residue_weak",
    materialFamily: "residue_silt",
    adhesion: 0.46,
    loadTolerance: 0.32,
    compliance: 0.92,
    verbTransmission: Object.freeze({ pulse: 0.30, absorb: 0.86, stabilize: 0.58 }),
    regionalRole: "fragile_contact_field",
    description: "loose residue that can accept a temporary seal but poorly carries recoil"
  })
});

export function applyCrawlableSurfaceMetadata(object, {
  surfaceId,
  profileId,
  cellId,
  regionalRole = null,
  contactPriority = 0
} = {}) {
  if (!object?.userData) throw new Error("[CrawlableSurfaceRegistry] object with userData is required.");
  const profile = CRAWLABLE_SURFACE_PROFILES[profileId];
  if (!profile) throw new Error(`[CrawlableSurfaceRegistry] Unknown profile: ${profileId}`);
  if (!surfaceId) throw new Error("[CrawlableSurfaceRegistry] surfaceId is required.");

  object.userData.crawlableSurface = true;
  object.userData.crawlableSurfaceAuthority = "HC031F1B_authored_ecological_surface";
  object.userData.crawlableSurfaceId = surfaceId;
  object.userData.crawlableSurfaceProfileId = profile.id;
  object.userData.crawlableSurfaceCellId = cellId ?? "shared";
  object.userData.crawlableSurfaceContactPriority = Number(contactPriority) || 0;
  object.userData.crawlableSurfaceProfile = {
    materialFamily: profile.materialFamily,
    adhesion: profile.adhesion,
    loadTolerance: profile.loadTolerance,
    compliance: profile.compliance,
    verbTransmission: { ...profile.verbTransmission },
    regionalRole: regionalRole ?? profile.regionalRole,
    description: profile.description
  };
  object.userData.targetingSuppressed = true;
  return object;
}

export function readCrawlableSurfaceMetadata(object) {
  if (!object?.userData?.crawlableSurface) return null;
  const profileId = object.userData.crawlableSurfaceProfileId;
  const profile = CRAWLABLE_SURFACE_PROFILES[profileId];
  if (!profile) return null;
  const authored = object.userData.crawlableSurfaceProfile ?? {};
  return {
    surfaceId: object.userData.crawlableSurfaceId ?? object.name ?? object.uuid,
    profileId,
    cellId: object.userData.crawlableSurfaceCellId ?? "shared",
    contactPriority: Number(object.userData.crawlableSurfaceContactPriority) || 0,
    materialFamily: authored.materialFamily ?? profile.materialFamily,
    adhesion: Number.isFinite(authored.adhesion) ? authored.adhesion : profile.adhesion,
    loadTolerance: Number.isFinite(authored.loadTolerance) ? authored.loadTolerance : profile.loadTolerance,
    compliance: Number.isFinite(authored.compliance) ? authored.compliance : profile.compliance,
    verbTransmission: {
      pulse: Number.isFinite(authored.verbTransmission?.pulse) ? authored.verbTransmission.pulse : profile.verbTransmission.pulse,
      absorb: Number.isFinite(authored.verbTransmission?.absorb) ? authored.verbTransmission.absorb : profile.verbTransmission.absorb,
      stabilize: Number.isFinite(authored.verbTransmission?.stabilize) ? authored.verbTransmission.stabilize : profile.verbTransmission.stabilize
    },
    regionalRole: authored.regionalRole ?? profile.regionalRole,
    description: authored.description ?? profile.description
  };
}
