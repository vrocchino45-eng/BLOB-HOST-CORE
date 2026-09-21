export class VisualRecipeRegistry {
  constructor({ recipeDataSystem }) {
    if (!recipeDataSystem) {
      throw new Error("[VisualRecipeRegistry] recipeDataSystem is required.");
    }

    this.recipeDataSystem = recipeDataSystem;
  }

  get(recipeId) {
    return this.recipeDataSystem.get("visualCompositionRecipes", recipeId);
  }

  has(recipeId) {
    return this.recipeDataSystem.data.visualCompositionRecipes.has(recipeId);
  }

  list() {
    return [...this.recipeDataSystem.data.visualCompositionRecipes.values()];
  }
}
