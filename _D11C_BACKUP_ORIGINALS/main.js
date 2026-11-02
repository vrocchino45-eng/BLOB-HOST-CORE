import { GameRuntime } from "./core/GameRuntime.js";

// HC031W1 turns the accepted W audit into deliberate stabilized aim and local physical context.
// LT + right-stick may steer an existing Stabilize relationship toward a centered local noun;
// pre-entry remote Gathering Ground observation remains intact, while three authored local surfaces add contact truth.

const appRoot = document.querySelector("#app");

if (!appRoot) {
  throw new Error("[BLOB BOOT] Missing #app root element.");
}

const runtime = new GameRuntime({
  appRoot,
  buildId: "HC-031W1",
  buildLabel: "Stabilized Aim + Local Contact Proof"
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
