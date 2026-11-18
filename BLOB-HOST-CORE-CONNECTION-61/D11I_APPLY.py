#!/usr/bin/env python3
"""Guarded, reversible D11I debug-only event observer extension over installed D11H."""
from __future__ import annotations
import argparse, hashlib, json, sys
from pathlib import Path
ROOT=Path(__file__).resolve().parent
PROBE=ROOT/'src/debug/BOT1D11CDiagnosticProbe.js'
HELPER=ROOT/'src/debug/BOT1D11IEventReasonRecorder.js'
BACKDIR=ROOT/'D11I_BACKUP_ORIGINALS'
BACK=BACKDIR/'BOT1D11CDiagnosticProbe.js'
META=BACKDIR/'manifest.json'
NEW_IMPORT='import { installBOT1D11IEventReasonRecorder } from "./BOT1D11IEventReasonRecorder.js";'
IMP='import { installBOT1D11HFirstFootholdTimeline } from "./BOT1D11HFirstFootholdTimeline.js";'
INIT='  const d11h = installBOT1D11HFirstFootholdTimeline(runtime);'
RESET='d11h.reset(); collect();'
DUMP='firstFoothold: d11h.dump(), exportedAt: new Date().toISOString()'
STOP='d11h.stop(); }'
def sha(b):return hashlib.sha256(b).hexdigest()
def transform(data):
    text=data.decode('utf-8')
    if NEW_IMPORT in text:raise ValueError('D11I already present')
    for phrase in (IMP,INIT,RESET,DUMP,STOP):
        if text.count(phrase)!=1:raise ValueError('Expected installed D11H hook not found exactly once: '+phrase[:60])
    eol='\r\n' if b'\r\n' in data else '\n'
    text=text.replace(IMP,IMP+eol+NEW_IMPORT,1)
    text=text.replace(INIT,INIT+eol+'  const d11i = installBOT1D11IEventReasonRecorder(runtime);',1)
    text=text.replace(RESET,'d11h.reset(); d11i.reset(); collect();',1)
    text=text.replace(DUMP,'firstFoothold: d11h.dump(), firstFootholdEvents: d11i.dump(), exportedAt: new Date().toISOString()',1)
    text=text.replace(STOP,'d11h.stop(); d11i.stop(); }',1)
    return text.encode('utf-8')
def main():
    p=argparse.ArgumentParser(description=__doc__)
    g=p.add_mutually_exclusive_group(required=True)
    for key in ('check','apply','undo'):g.add_argument('--'+key,action='store_true')
    args=p.parse_args()
    if args.undo:
        if not BACK.exists() or not META.exists() or not PROBE.exists():raise ValueError('Cannot rollback: backup, manifest or probe missing')
        meta=json.loads(META.read_text())
        if sha(PROBE.read_bytes())!=meta['patched']:raise ValueError('Probe differs from D11I patch: unsafe rollback refused')
        if sha(BACK.read_bytes())!=meta['original']:raise ValueError('Backup checksum mismatch')
        PROBE.write_bytes(BACK.read_bytes());print('D11I diagnostic reversed byte-identically; D11H retained')
        return
    if not PROBE.exists() or not HELPER.exists():raise ValueError('D11H probe or new event observer missing')
    current=PROBE.read_bytes()
    if META.exists() or BACK.exists():
        if not META.exists() or not BACK.exists():raise ValueError('Incomplete D11I backup')
        meta=json.loads(META.read_text())
        if sha(BACK.read_bytes())!=meta['original']:raise ValueError('Backup corrupted')
        if sha(current)==meta['patched']:
            print('D11I already installed; no changes');return
        if sha(current)!=meta['original']:raise ValueError('Current probe changed; refusing reinstall')
    changed=transform(current)
    if META.exists() and sha(changed)!=meta['patched']:raise ValueError('Patch reconstruction differs')
    print('D11I preflight OK. Only existing D11C debug probe will be edited.')
    if args.check:return
    if not BACKDIR.exists():BACKDIR.mkdir()
    if not BACK.exists():BACK.write_bytes(current)
    try:
        PROBE.write_bytes(changed)
        META.write_text(json.dumps({'original':sha(current),'patched':sha(changed)},indent=2))
    except Exception:
        PROBE.write_bytes(current);raise
    print('D11I applied. No gameplay owner source edits. Undo: py .\\D11I_APPLY.py --undo')
if __name__=='__main__':
    try:main()
    except Exception as e:print('D11I STOPPED:',e,file=sys.stderr);raise SystemExit(1)
