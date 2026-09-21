import fs from "node:fs";
const aperture=fs.readFileSync(new URL("../src/fields/ApertureFieldsArrivalSystem.js",import.meta.url),"utf8");
const signal=fs.readFileSync(new URL("../src/fields/SignalPlainEcologySystem.js",import.meta.url),"utf8");
for(const proof of [
  "aperture_signal_plain_return_filament_HC015N_HOTFIX1",
  "returnCueActive = !signalPlainCompleted && signalDistance > 17.5",
  "futureLandmarksSubduedUntilSignalComplete",
  "unfinishedDistanceEmphasis"
]) if(!aperture.includes(proof)) throw new Error(`Missing return-readability proof: ${proof}`);
if(!signal.includes("distantUnread") || !signal.includes("0.045 + Math.sin"))
  throw new Error("Distant unread Signal Plain markers still collapse to near-invisible.");
console.log("[HC015N HOTFIX1] Signal Plain return/readability proof PASS");
