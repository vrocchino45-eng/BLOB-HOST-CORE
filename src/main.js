import { GameRuntime } from "./core/GameRuntime.js";

// HC031K1 preserves the locked K/HF1 attachment grammar while making free→surface
// and surface→free velocity handoff continuous. Verbs, camera, ecology, targeting,
// and contact ownership remain outside this pass.

const appRoot = document.querySelector("#app");

if (!appRoot) {
  throw new Error("[BLOB BOOT] Missing #app root element.");
}

const runtime = new GameRuntime({
  appRoot,
  buildId: "HC-031K1",
  buildLabel: "Surface / Free Momentum Handoff"
});

runtime.start().catch((error) => {
  console.error("[BLOB BOOT] Failed to start runtime:", error);

  const errorPanel = document.createElement("pre");
  errorPanel.textContent = `${error.name}: ${error.message}\n\n${error.stack ?? ""}`;

  Object.assign(errorPanel.style, {
    position: "fixed",
    inset: "16px",
    padding: "16px",
    overflow: "auto",
    color: "#ffd8d8",
    background: "rgba(40, 0, 0, 0.88)",
    border: "1px solid rgba(255, 120, 120, 0.5)",
    borderRadius: "10px",
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    fontSize: "13px",
    zIndex: "999"
  });

  document.body.appendChild(errorPanel);
});
