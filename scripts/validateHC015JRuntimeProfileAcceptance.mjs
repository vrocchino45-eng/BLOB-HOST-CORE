import fs from "node:fs";

const recipe = fs.readFileSync(new URL("../src/data/RecipeDataSystem.js", import.meta.url), "utf8");
const profile = JSON.parse(fs.readFileSync(new URL("../public/data/runtime/act1RuntimeProfile_HC015J.json", import.meta.url), "utf8"));

if (profile.id !== "ACT1_RUNTIME_PROFILE_HC014G") {
  throw new Error(`[HC015J HOTFIX1] Unexpected inherited runtime profile id: ${profile.id}`);
}
if (profile.pass !== "HC-015J") {
  throw new Error(`[HC015J HOTFIX1] Runtime profile pass is not HC-015J: ${profile.pass}`);
}
if (!recipe.includes('"HC-015J"].includes(profile.pass)')) {
  throw new Error("[HC015J HOTFIX1] RecipeDataSystem still rejects the HC-015J successor pass.");
}
if (!recipe.includes('/data/runtime/act1RuntimeProfile_HC015J.json')) {
  throw new Error("[HC015J HOTFIX1] RecipeDataSystem is not loading the HC-015J runtime profile.");
}

console.log("[HC015J HOTFIX1] Runtime profile acceptance proof PASS");
