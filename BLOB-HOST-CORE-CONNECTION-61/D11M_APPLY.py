#!/usr/bin/env python3
"""D11M reversible diagnostic API exposure; changes no gameplay owner.

Requires D11L to be present. Makes the existing D11L observer stoppable
independently while retaining D11C/F/H/I capture and unmodified Core physics.
"""
from __future__ import annotations
import argparse, hashlib, json, os, sys
from pathlib import Path
ROOT = Path(__file__).resolve().parent
PROBE = ROOT/'src/debug/BOT1D11CDiagnosticProbe.js'
BACKDIR = ROOT/'D11M_BACKUP_ORIGINALS'
BACK = BACKDIR/'BOT1D11CDiagnosticProbe.js'
META = BACKDIR/'manifest.json'
ANCHOR = '    controlledStart: placeAboveSiltShelf,'
MARKER = 'disableD11LReleaseRecorder() { d11l.stop(); return true; },'

def sha(b): return hashlib.sha256(b).hexdigest()

def transform(data):
    raw = data.decode('utf-8')
    if MARKER in raw: raise ValueError('D11M API already present without known backup')
    for token in (ANCHOR,'releaseGate: d11l.dump()',
                  'const d11l = installBOT1D11LReleaseGateRecorder(runtime);'):
        if raw.count(token) != 1: raise ValueError('Expected D11L probe signature absent: '+token)
    newline='\r\n' if b'\r\n' in data else '\n'
    return raw.replace(ANCHOR,ANCHOR+newline+'    '+MARKER,1).encode('utf-8')

def main(argv=None):
    p=argparse.ArgumentParser(description=__doc__)
    modes=p.add_mutually_exclusive_group(required=True)
    for m in ('check','apply','undo'): modes.add_argument('--'+m,action='store_true')
    args=p.parse_args(argv)
    if args.undo:
        if not all(x.exists() for x in (META,BACK,PROBE)): raise ValueError('Missing rollback metadata')
        m=json.loads(META.read_text(encoding='utf-8'))
        if sha(PROBE.read_bytes()) != m['patched']: raise ValueError('Probe changed since install; refusing unsafe undo')
        if sha(BACK.read_bytes()) != m['original']: raise ValueError('Backup mismatch')
        PROBE.write_bytes(BACK.read_bytes())
        print('D11M undone byte-for-byte; previous D11L observer remains installed.')
        return 0
    if not PROBE.exists(): raise ValueError('D11C diagnostic probe absent')
    data=PROBE.read_bytes()
    if META.exists() or BACK.exists():
        if not (META.exists() and BACK.exists()): raise ValueError('Partial backup, refusing')
        m=json.loads(META.read_text(encoding='utf-8'))
        if sha(BACK.read_bytes())!=m['original']: raise ValueError('Backup changed')
        if sha(data)==m['patched']:
            print('D11M already installed'); return 0
        if sha(data)!=m['original']: raise ValueError('Probe drift, refusing overwrite')
    patched=transform(data)
    if META.exists() and sha(patched)!=m['patched']: raise ValueError('Patch checksum mismatch')
    print('D11M preflight passed; only the diagnostic probe API changes.')
    if args.check:return 0
    BACKDIR.mkdir(exist_ok=True)
    if not BACK.exists():BACK.write_bytes(data)
    try:
        PROBE.write_bytes(patched)
        META.write_text(json.dumps({'original':sha(data),'patched':sha(patched)},indent=2)+'\n',encoding='utf-8')
    except Exception:
        PROBE.write_bytes(data)
        raise
    print('D11M installed. Undo: py .\\D11M_APPLY.py --undo')
    return 0

if __name__=='__main__':
    try:raise SystemExit(main())
    except Exception as exc:
        print('D11M STOPPED:',exc,file=sys.stderr);raise SystemExit(1)
