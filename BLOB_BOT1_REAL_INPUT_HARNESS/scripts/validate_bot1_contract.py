#!/usr/bin/env python3
"""Read-only source compatibility check for BOT1 browser runner. Changes nothing."""
import argparse,json,pathlib,re,sys,datetime
p=argparse.ArgumentParser(description='BOT1 source contract preflight')
p.add_argument('--project',default='.')
a=p.parse_args()
root=pathlib.Path(a.project).resolve()
checks={
 'src/input/ControlMap.js':[
  ('movement W',r'KeyW'),('movement A',r'KeyA'),('movement S',r'KeyS'),
  ('movement D',r'KeyD'),('lift C',r'KeyC'),('descend Z',r'KeyZ'),
  ('stabilize Q',r'KeyQ'),('absorb mouse',r'mouseButtons\.has\(2\)'),
  ('interact E',r'interactPressed'),('guide focus',r'guideFocusPressed')],
 'src/input/InputSystem.js':[
  ('keyboard listener',r'addEventListener\("keydown"'),
  ('mouse listener',r'addEventListener\("mousedown"'),
  ('Pulse Key X',r'event\.code === "KeyX"'),
  ('interact Key E',r'event\.code === "KeyE"'),
  ('focus Key F',r'event\.code === "KeyF"')],
 'src/debug/WorldObjectCensusSystem.js':[
  ('REC1 recorder',r'captureEvents'),('REC1 stop-start hotkey',r'event\.code === [\'\"]KeyR[\'\"]'),
  ('REC1 export hotkey',r'event\.code === [\'\"]KeyE[\'\"]'),
  ('REC1 export API',r'exportTimeline\('),
  ('REC1 full retention policy',r'append_only_for_current_capture_no_2500_event_rollover')],
 'src/core/SessionTelemetrySystem.js':[
  ('telemetry API',r'window\.BLOB_TELEMETRY'),
  ('telemetry session reader',r'getSession:\s*\(\)\s*=>\s*this\.exportSession\(')],
 'src/ui/PlaytestHudSystem.js':[
  ('visible HUD selector',r'playtest-hud-panel'),
  ('HUD state reader',r'resolveHudState\(')]
}
rows=[]
for path,items in checks.items():
 file=root/path
 try:content=file.read_text(encoding='utf-8')
 except FileNotFoundError:content=''
 for label,regex in items:
  ok=bool(re.search(regex,content))
  rows.append({'file':path,'check':label,'status':'PASS' if ok else 'FAIL'})
summary={'project':str(root),'checkedAtUtc':datetime.datetime.now(datetime.timezone.utc).isoformat(),
 'passed':sum(x['status']=='PASS' for x in rows),'total':len(rows),'allPassed':all(x['status']=='PASS' for x in rows),
 'checks':rows,'safety':'Static read-only check. Does not verify browser runtime or installed package version.'}
print(json.dumps(summary,indent=2))
sys.exit(0 if summary['allPassed'] else 2)
