// HC027K1 HOTFIX2 runtime smoke proof: exercise actual debug mode + overlay methods
// with a tiny DOM shim so scope/renderer errors surface before browser playtest.
class FakeElement {
  constructor(tag = "div") {
    this.tag = tag;
    this.id = "";
    this.style = {};
    this.children = [];
    this.textContent = "";
  }
  appendChild(child) { this.children.push(child); return child; }
  append(...children) { this.children.push(...children); }
  replaceChildren(...children) { this.children = [...children]; }
}

globalThis.document = {
  body: new FakeElement("body"),
  createElement: (tag) => new FakeElement(tag)
};
globalThis.window = { addEventListener() {} };

const { DebugDisplaySystem } = await import("../src/debug/DebugDisplaySystem.js");
const { RecipeDebugOverlay } = await import("../src/debug/RecipeDebugOverlay.js");

const frameState = {
  buildId: "HC-027K1",
  buildLabel: "Playtest Input Instrumentation + Hot Button Reference",
  runtimeSeconds: 12.4,
  frame: 744,
  activeCellId: "CELL_APERTURE_FIELDS_ARRIVAL_001",
  input: {
    primaryActionContext: "world",
    pulseHeld: true,
    pulseCommitment: "charging",
    pulseHoldSeconds: 0.82,
    pulseCharge01: 0.64,
    pulseReleaseCharge01: 0,
    pulseReleaseKind: "none",
    absorbHeld: false,
    stabilizeHeld: false,
    moveX: 0,
    moveY: 0,
    moveZ: 0
  },
  inputSource: { activeDevice: "gamepad", absorbTriggerValue: 0, stabilizeTriggerValue: 0 },
  inputTelemetry: {
    context: "world",
    expectedAction: "probe_host",
    activePhysical: ["Pad X", "LS 0.76"],
    activeActions: ["PULSE CHARGING 64% 0.82s", "MOVE 0.00/0.76/0.00"],
    recentEvents: [{ ageSeconds: 0.1, text: "PAD X DOWN" }]
  },
  playerKinematics: { position: {x:1,y:2,z:3}, speed: 1.5, movementBoundary: {} },
  corePerformance: { personality: "output-biased", endurance: { reservePercent: 82 } },
  coreSensoryResponse: { pulseMode: "charged", activeReturnCount: 2 },
  targeting: { targetId: "host_membrane_test" },
  signalPlainEcology: { consequenceNextQuestion: { primary: { sourceNodeNumber: 2, targetNodeNumber: 1, relation: "coherent_answer_wakes_sympathetic_breath" } } },
  nonFatalSystemErrors: [],
  debugDisplay: { mode: "hidden" }
};

const display = new DebugDisplaySystem({ frameState });
display.init();
const overlay = new RecipeDebugOverlay({ frameState });
overlay.init();

const key = (code) => ({ code, preventDefault() {} });

display.onKeyDown(key("F1"));
overlay.update();
if (frameState.debugDisplay.mode !== "trace") throw new Error("F1 did not select trace mode");
if (overlay.inputEl.style.display !== "block") throw new Error("F1 trace input panel is not visible");
if (!overlay.el.textContent.includes("PLAYTEST TRACE")) throw new Error("F1 context trace did not render");
if (!overlay.inputEl.children.some((child) => child.textContent.includes("PULSE CHARGING"))) throw new Error("F1 interpreted action did not render");

// Simulate release frame, then a later idle frame: interpreted action should remain readable.
frameState.runtimeSeconds = 12.6;
frameState.input.pulseHeld = false;
frameState.input.pulseCommitment = "released";
frameState.input.pulseHoldSeconds = 0;
frameState.input.pulseReleaseCharge01 = 0.64;
frameState.input.pulseReleaseKind = "charged";
frameState.inputTelemetry.activePhysical = [];
frameState.inputTelemetry.activeActions = ["PULSE RELEASE CHARGED 64%"];
frameState.inputTelemetry.recentEvents = [{ ageSeconds: 0.0, text: "PAD X UP" }];
overlay.update();

frameState.runtimeSeconds = 14.7;
frameState.inputTelemetry.activeActions = [];
overlay.update();
if (!overlay.inputEl.children.some((child) => child.textContent.includes("PULSE RELEASE CHARGED 64%"))) throw new Error("released action did not persist for video readability");

display.onKeyDown(key("F2"));
overlay.update();
if (frameState.debugDisplay.mode !== "full") throw new Error("F2 did not select full system debug");
if (overlay.inputEl.style.display !== "none") throw new Error("F2 system debug still shows large input panel");
if (!overlay.el.textContent.includes("PLAYER / CAMERA / ERRORS")) throw new Error("F2 full system debug did not render");

display.onKeyDown(key("F3"));
overlay.update();
if (frameState.debugDisplay.mode !== "hidden") throw new Error("F3 did not select clean/hidden mode");
if (overlay.el.style.display !== "none" || overlay.inputEl.style.display !== "none") throw new Error("F3 did not hide debug overlays");

console.log("PASS HC027K1 HOTFIX2 debug HUD runtime smoke");
console.log("  F1 trace renders physical + interpreted input and persists a released action");
console.log("  F2 renders deep system debug without the large input panel");
console.log("  F3 hides both debug overlays");
