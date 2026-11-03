#!/usr/bin/env python3
"""Guarded/reversible D11L debug observer extension; NO gameplay owner modifications."""
from __future__ import annotations
import argparse, hashlib, json, sys
from pathlib import Path
ROOT=Path(__file__).resolve().parent
PROBE=ROOT/'src/debug/BOT1D11CDiagnosticProbe.js'
HELPER=ROOT/'src/debug/BOT1D11LReleaseGateRecorder.js'
BACKDIR=ROOT/'D11L_BACKUP_ORIGINALS'
BACK=BACKDIR/'BOT1D11CDiagnosticProbe.js'
META=BACKDIR/'manifest.json'
NEW_IMPORT='import { installBOT1D11LReleaseGateRecorder } from "./BOT1D11LReleaseGateRecorder.js";'
IMP='import { installBOT1D11IEventReasonRecorder } from "./BOT1D11IEventReasonRecorder.js";'
INIT='  const d11i = installBOT1D11IEventReasonRecorder(runtime);'
RESET='d11h.reset(); d11i.reset(); collect();'
DUMP='firstFootholdEvents: d11i.dump(), exportedAt: new Date().toISOString()'
STOP='d11h.stop(); d11i.stop(); }'
def sha(data):return hashlib.sha256(data).hexdigest()
def transform(data):
    s=data.decode('utf-8')
    if NEW_IMPORT in s:raise ValueError('D11L already installed outside manifest')
    for token in (IMP,INIT,RESET,DUMP,STOP):
        if s.count(token)!=1:raise ValueError('Expected D11I diagnostic hook absent or duplicated: '+token[:70])
    eol='\r\n' if b'\r\n' in data else '\n'
    s=s.replace(IMP,IMP+eol+NEW_IMPORT,1)
    s=s.replace(INIT,INIT+eol+'  const d11l = installBOT1D11LReleaseGateRecorder(runtime);',1)
    s=s.replace(RESET,'d11h.reset(); d11i.reset(); d11l.reset(); collect();',1)
    s=s.replace(DUMP,'firstFootholdEvents: d11i.dump(), releaseGate: d11l.dump(), exportedAt: new Date().toISOString()',1)
    s=s.replace(STOP,'d11h.stop(); d11i.stop(); d11l.stop(); }',1)
    return s.encode('utf-8')
def main(argv=None):
    p=argparse.ArgumentParser(description=__doc__)
    group=p.add_mutually_exclusive_group(required=True)
    for cmd in ('check','apply','undo'):group.add_argument('--'+cmd,action='store_true')
    args=p.parse_args(argv)
    if args.undo:
        if not all(x.is_file() for x in (BACK,META,PROBE)):raise ValueError('Missing rollback metadata')
        m=json.loads(META.read_text(encoding='utf-8'))
        if sha(PROBE.read_bytes())!=m['patched']:raise ValueError('Probe drift; refusing unsafe rollback')
        if sha(BACK.read_bytes())!=m['original']:raise ValueError('Backup checksum mismatch')
        PROBE.write_bytes(BACK.read_bytes())
        print('D11L removed byte-identically. D11F/H/I and gameplay retained.')
        return 0
    if not all(x.is_file() for x in (PROBE,HELPER)):
        raise ValueError('D11I probe or D11L helper missing; unzip into repository root')
    raw=PROBE.read_bytes()
    if META.exists() or BACK.exists():
        if not META.is_file() or not BACK.is_file():raise ValueError('Partial backup exists')
        m=json.loads(META.read_text(encoding='utf-8'))
        if sha(BACK.read_bytes())!=m['original']:raise ValueError('Backup checksum mismatch')
        if sha(raw)==m['patched']:
            print('D11L already installed; no change');return 0
        if sha(raw)!=m['original']:raise ValueError('Probe drift; refusing to overwrite')
    patched=transform(raw)
    if META.exists() and sha(patched)!=m['patched']:raise ValueError('Patch does not match prior manifest')
    print('D11L preflight OK; only existing diagnostic probe will be patched.')
    if args.check:return 0
    BACKDIR.mkdir(exist_ok=True)
    if not BACK.exists():BACK.write_bytes(raw)
    try:
        PROBE.write_bytes(patched)
        META.write_text(json.dumps({'original':sha(raw),'patched':sha(patched)},indent=2)+'\n',encoding='utf-8')
    except Exception:
        PROBE.write_bytes(raw);raise
    print('D11L applied. Undo: py .\\D11L_APPLY.py --undo')
    return 0
if __name__=='__main__':
    try:raise SystemExit(main())
    except Exception as exc:
        print('D11L STOPPED:',exc,file=sys.stderr);raise SystemExit(1)
