import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";

const [checkout, mode] = process.argv.slice(2);
if (!checkout || (mode && mode !== "--index")) {
  throw new Error("Usage: node verify-overlay.mjs <checkout-path> [--index]");
}
const root = path.resolve(checkout);
const manifestUrl = new URL("../manifests/working-tree-changes.json", import.meta.url);
const manifest = JSON.parse(readFileSync(manifestUrl, "utf8"));

function fileBytes(relativePath) {
  const filename = path.resolve(root, relativePath);
  if (!filename.startsWith(root + path.sep)) {
    throw new Error("File outside checkout: " + relativePath);
  }
  if (mode !== "--index") return readFileSync(filename);
  const blob = spawnSync("git", ["--no-optional-locks", "cat-file", "blob", ":" + relativePath], {
    cwd: root,
    maxBuffer: 32 * 1024 * 1024,
    windowsHide: true
  });
  if (blob.status !== 0) throw new Error("Cannot read index blob for " + relativePath);
  return blob.stdout;
}

const failed = [];
for (const entry of manifest) {
  const bytes = fileBytes(entry.path);
  const digest = createHash("sha256").update(bytes).digest("hex");
  if (bytes.length !== entry.bytes || digest !== entry.sha256) failed.push(entry.path);
}

if (failed.length) {
  console.error("Admitted byte mismatch:\n" + failed.join("\n"));
  process.exitCode = 1;
} else {
  console.log("Verified " + manifest.length + " admitted files in the " +
    (mode === "--index" ? "index" : "checkout") + ".");
}
