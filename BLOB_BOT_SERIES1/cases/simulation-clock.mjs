// Observe the real runtime clock. Never write game time or drive owner updates.
export function simulationClock(page){
 const now=()=>page.evaluate(()=>window.__CAMERA_AUDIT_RUNTIME__.frameState.runtimeSeconds);
 return {now,async advance(seconds){const started=await now();await page.waitForFunction(({started,seconds})=>window.__CAMERA_AUDIT_RUNTIME__.frameState.runtimeSeconds-started>=seconds,{started,seconds},{timeout:120000});}};
}
