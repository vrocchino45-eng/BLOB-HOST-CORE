import * as THREE from "three";
import { EnvironmentVisualComposer } from "./composers/EnvironmentVisualComposer.js";
import { ChemObjectVisualComposer } from "./composers/ChemObjectVisualComposer.js";
import { EntityVisualComposer } from "./composers/EntityVisualComposer.js";
import { OrbiterVisualComposer } from "./composers/OrbiterVisualComposer.js";

export class VisualComposer {
  constructor({ scene, visualRecipeRegistry, placeholderValidator }) {
    if (!scene) throw new Error("[VisualComposer] scene is required.");
    if (!visualRecipeRegistry) {
      throw new Error("[VisualComposer] visualRecipeRegistry is required.");
    }

    this.scene = scene;
    this.visualRecipeRegistry = visualRecipeRegistry;
    this.placeholderValidator = placeholderValidator;
    this.composedObjects = [];

    this.environmentComposer = new EnvironmentVisualComposer();
    this.chemObjectComposer = new ChemObjectVisualComposer();
    this.entityComposer = new EntityVisualComposer();
    this.orbiterComposer = new OrbiterVisualComposer();
  }



  compose({ objectId, visualRecipeId, placeholderRecipeId = null, position = [0, 0, 0], scale = 1 }) {
    const recipe = this.visualRecipeRegistry.get(visualRecipeId);
    const root = new THREE.Group();
    root.name = objectId;

    root.userData = this.createUserData({
      objectId,
      visualRecipeId,
      placeholderRecipeId,
      recipe
    });

    if (root.userData.placeholder && this.placeholderValidator) {
      this.placeholderValidator.validateObjectUserData(root.userData);
    }

    this.composeBySilhouette(root, recipe);

    root.position.set(position[0], position[1], position[2]);
    root.scale.setScalar(scale);

    this.scene.add(root);
    this.composedObjects.push({ root, recipe, baseScale: scale });

    return root;
  }



  createUserData({ objectId, visualRecipeId, placeholderRecipeId, recipe }) {
    const hasPlaceholderContract = Boolean(placeholderRecipeId);
    const meaning = recipe.meaning ?? {};
    const composition = recipe.composition ?? {};
    let allowedUntilPass = hasPlaceholderContract ? "HC_VIS_003" : null;
    let placeholderRecipe = null;

    if (hasPlaceholderContract && this.placeholderValidator?.recipeDataSystem) {
      try {
        placeholderRecipe = this.placeholderValidator.recipeDataSystem.get(
          "placeholderReplacementRecipes",
          placeholderRecipeId
        );
        allowedUntilPass = placeholderRecipe.placeholder?.allowedUntilPass ?? allowedUntilPass;
      } catch (_error) {
        allowedUntilPass = "HC_VIS_003";
      }
    }

    const visualLockStatus = placeholderRecipe?.visualLock?.status ?? recipe.visualLock?.status ?? "none";
    const visualLocked = visualLockStatus === "replaced_by_recipe_composition" ||
      recipe.visualLock?.status === "p0_locked_recipe_composition";
    const placeholder = hasPlaceholderContract && !visualLocked;

    return {
      objectId,
      placeholder,
      currentVisual: visualLocked
        ? "p0_visual_locked_recipe_composition"
        : placeholder
          ? "recipe_composed_placeholder"
          : "recipe_composed_visual",
      replacementRecipe: hasPlaceholderContract ? visualRecipeId : null,
      placeholderRecipe: placeholderRecipeId,
      allowedUntilPass,
      visualRecipe: visualRecipeId,
      hostSource: meaning.host ?? "HOST_ALPHA_WOUNDED_NURSERY",
      anatomySource: meaning.anatomy ?? "unknown",
      chemistry: meaning.chemistry ?? [],
      matterState: meaning.matterState ?? "unknown",
      function: meaning.function ?? "unknown",
      silhouette: composition.silhouette ?? "unknown",
      surface: composition.surface ?? "unknown",
      motion: composition.motion ?? "unknown",
      lastPulseResponse: "none",
      visualUpgradePass: recipe.visualLock?.pass ?? composition.visualLockPass ?? "HC-001M",
      visualLockStatus,
      visualReadability: composition.readabilityLayer ?? composition.silhouette ?? "unknown"
    };
  }



  composeBySilhouette(root, recipe) {
    const silhouette = recipe.composition?.silhouette ?? "small_protected_core";

    if (this.tryCompose(this.chemObjectComposer, root, silhouette)) return;
    if (this.tryCompose(this.environmentComposer, root, silhouette)) return;
    if (this.tryCompose(this.entityComposer, root, silhouette)) return;
    if (this.tryCompose(this.orbiterComposer, root, silhouette)) return;

    this.composeFallback(root);
  }

  tryCompose(composer, root, silhouette) {
    const methodName = composer.silhouetteMap?.[silhouette];
    if (!methodName || typeof composer[methodName] !== "function") return false;
    composer[methodName](root);
    return true;
  }

  composeFallback(root) {
    const material = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.5,
      transparent: true,
      opacity: 0.6
    });

    const mesh = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 1), material);
    mesh.name = "visual_composer_fallback";
    root.add(mesh);
  }



  update(dt, frameState) {
    for (const item of this.composedObjects) {
      const { root, recipe, baseScale } = item;
      if (!root.visible) continue;
      const motion = recipe.composition?.motion ?? "none";
      const t = frameState.runtimeSeconds;

      if (motion.includes("breathing") || motion.includes("wobble")) {
        const pulse = 1 + Math.sin(t * 2.0) * 0.035;
        root.scale.setScalar(baseScale * pulse);
      }

      if (motion.includes("deformation")) {
        const pulse = 1 + Math.sin(t * 0.45) * 0.045;
        root.scale.set(baseScale * pulse, baseScale * (1 / pulse), baseScale);
      }

      if (motion.includes("recoil")) {
        root.rotation.y = Math.sin(t * 0.35) * 0.025;
      }

      if (motion.includes("rotation") || motion.includes("dormant")) {
        root.rotation.y += dt * 0.22;
      }

      if (motion.includes("wave") || motion.includes("thread")) {
        root.rotation.y += dt * 0.08;
      }

      if (root.name === "host_alpha_distant_silhouette_001") {
        this.updateDistantHostContext(root, baseScale, t, frameState);
      }

      if (root.userData.visualRecipe === "player_seed_core_stage_01") {
        const kineticGlow = frameState.playerKinematics?.kineticGlow ?? 0;
        const inHub = frameState.activeCellId === "CELL_SIGNAL_CHORUS_NERVE_001"
          && Boolean(frameState.hubChamberFoundation?.active);
        root.scale.setScalar(baseScale * (inHub ? 1.12 : 1));
        root.rotation.set(0, 0, 0);

        const innerLight = root.getObjectByName("inner_seed_glow_light");
        if (innerLight) {
          innerLight.intensity = (inHub ? 1.48 : 1.14) + kineticGlow * 0.68;
        }

        const embryo = root.getObjectByName("nested_future_host_embryo");
        if (embryo) {
          embryo.rotation.y -= dt * 0.42;
          embryo.rotation.z += dt * 0.08;
          const embryoPulse = 1 + Math.sin(t * 2.6) * 0.05 + (frameState.pulse?.active ? 0.08 : 0);
          embryo.scale.set(0.72 * embryoPulse, 1.12 * embryoPulse, 0.72 * embryoPulse);
        }

        let moteIndex = 0;
        root.traverse((child) => {
          if (child.name !== "inner_seed_orbit_mote") return;
          const angle = t * (0.7 + moteIndex * 0.05) + moteIndex * 0.9;
          child.position.set(Math.cos(angle) * 0.48, Math.sin(angle * 1.7) * 0.12, Math.sin(angle) * 0.36);
          moteIndex += 1;
        });

        root.userData.playerIdentityMode = "authored_seed_body";
        root.userData.idleOrbitEffectsSuppressed = true;
        root.userData.visualMotionOwner = "CoreEmbodimentSystem";
      }
    }
  }

  updateDistantHostContext(root, baseScale, t, frameState) {
    const hubOwnsScene = frameState.activeCellId === "CELL_SIGNAL_CHORUS_NERVE_001"
      && Boolean(frameState.hubChamberFoundation?.active);

    if (hubOwnsScene) {
      root.position.set(-8.8, 4.8, -34);
      root.scale.setScalar(baseScale * 0.56 * (1 + Math.sin(t * 0.28) * 0.012));
      root.rotation.set(-0.08, -0.28 + Math.sin(t * 0.12) * 0.025, 0.14);
      root.userData.presentationRole = "background_anatomy_suggestion";
      root.userData.hubWorldMeaningOnly = true;
      root.userData.targetingSuppressed = true;
    } else {
      root.position.set(0.9, 2.8, -26);
      root.userData.presentationRole = "macro_host_context";
      root.userData.hubWorldMeaningOnly = false;
    }

    root.traverse((child) => {
      if (!child.material) return;
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      for (const material of materials) {
        if (material.userData.preHubOpacity === undefined) {
          material.userData.preHubOpacity = material.opacity ?? 1;
        }
        if (material.userData.preHubDepthWrite === undefined) {
          material.userData.preHubDepthWrite = material.depthWrite;
        }
        material.transparent = true;
        material.opacity = hubOwnsScene
          ? material.userData.preHubOpacity * 0.22
          : material.userData.preHubOpacity;
        material.depthWrite = hubOwnsScene ? false : material.userData.preHubDepthWrite;
      }
    });
  }
}
