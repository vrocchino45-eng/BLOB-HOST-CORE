#!/usr/bin/env python3
"""Guarded D11N test-only pre-approach hook. Does not alter gameplay owners."""
from __future__ import annotations
import argparse, hashlib, json, sys
from pathlib import Path
ROOT=Path(__file__).resolve().parent
PROBE=ROOT/'src/debug/BOT1D11CDiagnosticProbe.js'
FRAG=ROOT/'D11N_PROBE_FRAGMENT.js.txt'
BACKDIR=ROOT/'D11N_BACKUP_ORIGINALS'
BACK=BACKDIR/'BOT1D11CDiagnosticProbe.js'
META=BACKDIR/'manifest.json'
MARK='    controlledD11NPreApproachStart,'
ANCHORED='    controlledStart: placeAboveSiltShelf,'
DECL='  window.__BLOB_D11C_PROBE__ = Object.freeze({'
def sha(data):return hashlib.sha256(data).hexdigest()
def transform(data,fragment):
    raw=data.decode('utf-8')
    if MARK in raw or 'function controlledD11NPreApproachStart' in raw:
        raise ValueError('Existing D11N signature without exact backup')
    for token in (ANCHORED,DECL,'disableD11LReleaseRecorder()'):
        if raw.count(token)!=1:raise ValueError('Expected D11M diagnostic signature missing/duplicated: '+token)
    eol='\r\n' if b'\r\n' in data else '\n'
    insert=fragment.replace('\n',eol)
    raw=raw.replace(DECL,insert+DECL,1)
    raw=raw.replace(ANCHORED,ANCHORED+eol+MARK,1)
    return raw.encode('utf-8')
def main(argv=None):
    a=argparse.ArgumentParser(description=__doc__);g=a.add_mutually_exclusive_group(required=True)
    for v in ('check','apply','undo'):g.add_argument('--'+v,action='store_true')
    opt=a.parse_args(argv)
    if opt.undo:
        if not (META.is_file() and BACK.is_file() and PROBE.is_file()):raise ValueError('No complete rollback metadata')
        m=json.loads(META.read_text('utf-8'))
        if sha(BACK.read_bytes())!=m['original'] or sha(PROBE.read_bytes())!=m['patched']:
            raise ValueError('Backup or patched diagnostic drift; refusing unsafe rollback')
        PROBE.write_bytes(BACK.read_bytes())
        print('D11N test probe restored byte for byte; D11M remains installed')
        return 0
    if not (PROBE.is_file() and FRAG.is_file()):raise ValueError('D11M probe or D11N fragment missing')
    data=PROBE.read_bytes();fragment=FRAG.read_text('utf-8')
    if META.exists() or BACK.exists():
        if not (META.is_file() and BACK.is_file()):raise ValueError('Incomplete backup')
        m=json.loads(META.read_text('utf-8'))
        if sha(BACK.read_bytes())!=m['original']:raise ValueError('Backup changed')
        if sha(data)==m['patched']:
            print('D11N already installed');return 0
        if sha(data)!=m['original']:raise ValueError('Unexpected probe changes; refusing overwrite')
        patched=transform(data,fragment)
        if sha(patched)!=m['patched']:raise ValueError('Expected patch checksum drift')
    else:patched=transform(data,fragment)
    print('D11N preflight OK; only debug probe will change')
    if opt.check:return 0
    BACKDIR.mkdir(exist_ok=True)
    if not BACK.exists():BACK.write_bytes(data)
    try:
        PROBE.write_bytes(patched)
        META.write_text(json.dumps({'original':sha(data),'patched':sha(patched)},indent=2)+'\n',encoding='utf-8')
    except Exception:
        PROBE.write_bytes(data);raise
    print('D11N diagnostic installed; rollback: py .\\D11N_APPLY.py --undo')
    return 0
if __name__=='__main__':
    try:raise SystemExit(main())
    except Exception as exc:print('D11N STOPPED:',exc,file=sys.stderr);raise SystemExit(1)
