import { GameRuntime } from "./core/GameRuntime.js";

// HC031W1 turns the accepted W audit into deliberate stabilized aim and local physical context.
// LT + right-stick may steer an existing Stabilize relationship toward a centered local noun;
// pre-entry remote Gathering Ground observation remains intact, while three authored local surfaces add contact truth.

const appRoot = document.querySelector("#app");

if (!appRoot) {
  throw new Error("[BLOB BOOT] Missing #app root element.");
}

// Use the guarded scar repair coupling in standard play. The query value 0
// selects the original repair rate and 1 keeps the explicit trial marker.
const coreRepairComparison = new URLSearchParams(window.location.search).get('coreRepairTrial');
if (coreRepairComparison === '1') document.title += ' [Core repair trial]';
const runtime = new GameRuntime({
  appRoot,
  coreRepairTrial: coreRepairComparison !== '0',
  flowExperiment: new URLSearchParams(window.location.search).get('flow') === '1',
  nearWorldExperiment: new URLSearchParams(window.location.search).get('nearWorld') === '1',
  siltResistanceExperiment: new URLSearchParams(window.location.search).get('b3') === '1',
  buildId: "HC-031W1",
  buildLabel: "Stabilized Aim + Local Contact Proof"
});

// BOT1D11C: test-only, opt-in diagnostic. Normal gameplay boot remains unchanged.
runtime.start().then(async () => {
  if (import.meta.env.DEV && new URLSearchParams(window.location.search).get("bot1d11c") === "1") {
    const { installBOT1D11CProbe } = await import("./debug/BOT1D11CDiagnosticProbe.js");
    installBOT1D11CProbe(runtime);
  }
}).catch((error) => {
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
