export class PlaceholderValidator {
  constructor({ recipeDataSystem, currentPass }) {
    this.recipeDataSystem = recipeDataSystem;
    this.currentPass = currentPass;
    this.statusReport = {
      currentPass,
      total: 0,
      active: 0,
      expired: 0,
      missingReplacement: 0,
      expiredAcceptedForPrototype: 0,
      replacementRequiredBeforeVisualLock: 0,
      warnings: [],
      items: []
    };
  }

  validateAll() {
    const placeholders =
      this.recipeDataSystem.data.placeholderReplacementRecipes;

    this.statusReport = {
      currentPass: this.currentPass,
      total: 0,
      active: 0,
      expired: 0,
      missingReplacement: 0,
      expiredAcceptedForPrototype: 0,
      replacementRequiredBeforeVisualLock: 0,
      warnings: [],
      items: []
    };

    for (const placeholder of placeholders.values()) {
      this.validatePlaceholderRecipe(placeholder);
      this.recordPlaceholderStatus(placeholder);
    }
  }

  validatePlaceholderRecipe(recipe) {
    if (!recipe.id) {
      throw new Error("[PlaceholderValidator] Placeholder missing id.");
    }

    if (!recipe.placeholder?.active && recipe.placeholder?.active !== false) {
      throw new Error(
        `[PlaceholderValidator] ${recipe.id} missing placeholder.active.`
      );
    }

    if (!recipe.placeholder?.primitiveShape) {
      throw new Error(
        `[PlaceholderValidator] ${recipe.id} missing primitiveShape.`
      );
    }

    if (!recipe.placeholder?.allowedUntilPass) {
      throw new Error(
        `[PlaceholderValidator] ${recipe.id} missing allowedUntilPass.`
      );
    }

    if (!recipe.replacement?.recipeId) {
      throw new Error(
        `[PlaceholderValidator] ${recipe.id} missing replacement.recipeId.`
      );
    }

    try {
      this.recipeDataSystem.get(
        "visualCompositionRecipes",
        recipe.replacement.recipeId
      );
    } catch (error) {
      this.statusReport.missingReplacement += 1;
      throw error;
    }
  }

  recordPlaceholderStatus(recipe) {
    const active = Boolean(recipe.placeholder?.active);
    const allowedUntilPass = recipe.placeholder?.allowedUntilPass ?? "unknown";
    const expired = active && this.isExpired(allowedUntilPass);
    const replacementCategory = recipe.replacement?.replacementCategory ?? "unknown";
    const visualLockRequired = expired && this.requiresReplacementBeforeVisualLock(replacementCategory);
    const status = expired
      ? visualLockRequired
        ? "expired_replace_before_visual_lock"
        : "expired_accepted_for_prototype"
      : active
        ? "active"
        : "inactive";

    this.statusReport.total += 1;
    if (active) this.statusReport.active += 1;
    if (expired) {
      this.statusReport.expired += 1;
      if (visualLockRequired) this.statusReport.replacementRequiredBeforeVisualLock += 1;
      else this.statusReport.expiredAcceptedForPrototype += 1;
      this.statusReport.warnings.push(
        `${recipe.id} allowed until ${allowedUntilPass}; current pass is ${this.currentPass}; status ${status}`
      );
    }

    this.statusReport.items.push({
      id: recipe.id,
      active,
      status,
      allowedUntilPass,
      replacementRecipe: recipe.replacement?.recipeId ?? "missing",
      replacementCategory,
      visualLockRequired
    });
  }

  isExpired(allowedUntilPass) {
    if (!allowedUntilPass || allowedUntilPass === "unknown") return false;

    const currentRank = this.passRank(this.currentPass);
    const allowedRank = this.passRank(allowedUntilPass);

    if (currentRank !== null && allowedRank !== null) {
      return currentRank > allowedRank;
    }

    // HC_VIS placeholders are the early visual prototype line. Runtime passes
    // after HC-001 should report them as replacement-pressure warnings,
    // not fatal errors, so the build can keep running while we track them.
    if (allowedUntilPass.startsWith("HC_VIS") && /^HC-00[2-9]/.test(this.currentPass)) {
      return true;
    }

    return false;
  }

  passRank(passId) {
    if (!passId) return null;

    const hcMatch = passId.match(/^HC-(\d{3})([A-Z])$/);
    if (hcMatch) {
      const [, number, letter] = hcMatch;
      return Number(number) * 100 + (letter.charCodeAt(0) - 64);
    }

    const visualMatch = passId.match(/^HC_VIS_(\d+)$/);
    if (visualMatch) {
      return 100 + Number(visualMatch[1]);
    }

    return null;
  }

  requiresReplacementBeforeVisualLock(replacementCategory) {
    return [
      "player_visual",
      "orbiter_visual",
      "entity_visual",
      "morph_cell_visual"
    ].includes(replacementCategory);
  }

  getStatusReport() {
    return this.statusReport;
  }

  validateObjectUserData(userData) {
    if (!userData?.placeholder) return;

    if (!userData.objectId) {
      throw new Error("[PlaceholderValidator] Placeholder object missing objectId.");
    }

    if (!userData.replacementRecipe) {
      throw new Error(
        `[PlaceholderValidator] ${userData.objectId} has no replacementRecipe.`
      );
    }

    this.recipeDataSystem.get(
      "visualCompositionRecipes",
      userData.replacementRecipe
    );
  }
}
