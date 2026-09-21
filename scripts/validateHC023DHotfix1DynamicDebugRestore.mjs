import fs from "node:fs";
import path from "node:path";

const root = new URL("..", import.meta.url).pathname;
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const must = (condition, message) => {
  if (!condition) throw new Error(`[HC023D-HOTFIX1] ${message}`);
};

const runtime = read("src/core/GameRuntime.js");
const recipe = read("src/debug/RecipeDebugOverlay.js");
const chemistry = read("src/debug/ChemistryDebugPanel.js");
const summary = read("src/debug/RuntimeDiagnosticSummary.js");

must(runtime.includes('import("../debug/RecipeDebugOverlay.js")'), "RecipeDebugOverlay deferred import changed");
must(runtime.includes('import("../debug/ChemistryDebugPanel.js")'), "ChemistryDebugPanel deferred import changed");
must(recipe.includes("export class RecipeDebugOverlay"), "RecipeDebugOverlay export missing");
must(chemistry.includes("export class ChemistryDebugPanel"), "ChemistryDebugPanel export missing");
must(summary.includes("export function buildRuntimeDiagnosticSummary"), "RuntimeDiagnosticSummary export missing");

const sourceRoot = path.join(root, "src");
const sourceFiles = [];
const walk = (directory) => {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith(".js")) sourceFiles.push(full);
  }
};
walk(sourceRoot);
must(
  sourceFiles.length === 88
    || (fs.existsSync(path.join(root, "src/audio/EventAnchoredHostAudioSystem.js")) && sourceFiles.length === 89)
    || (fs.existsSync(path.join(root, "src/player/CoreEngineSystem.js")) && sourceFiles.length === 90)
    || (fs.existsSync(path.join(root, "src/player/CoreRadialPerformanceSystem.js")) && sourceFiles.length === 91)
    || (fs.existsSync(path.join(root, "src/player/CoreSensoryResponseSystem.js")) && sourceFiles.length === 92),
  `expected historical source count through HC027D, found ${sourceFiles.length}`
);

// Resolve every relative import used by active src, including literal dynamic imports.
const importPattern = /(?:import\s+(?:[^'"()]*?\s+from\s+)?|import\s*\()\s*["']([^"']+)["']/g;
const missing = [];
for (const file of sourceFiles) {
  const text = fs.readFileSync(file, "utf8");
  for (const match of text.matchAll(importPattern)) {
    const specifier = match[1];
    if (!specifier.startsWith(".")) continue;
    const target = path.resolve(path.dirname(file), specifier);
    const candidates = path.extname(target)
      ? [target]
      : [`${target}.js`, `${target}.mjs`, path.join(target, "index.js")];
    if (!candidates.some((candidate) => fs.existsSync(candidate))) {
      missing.push(`${path.relative(root, file)} -> ${specifier}`);
    }
  }
}
must(missing.length === 0, `active source has unresolved local imports:\n${missing.join("\n")}`);

console.log("[HC023D-HOTFIX1] deferred debug modules restored from HC023A archive PASS");
console.log("[HC023D-HOTFIX1] active source local import graph PASS");
console.log("[HC023D-HOTFIX1] historical source-count baseline + later owner additions PASS");
