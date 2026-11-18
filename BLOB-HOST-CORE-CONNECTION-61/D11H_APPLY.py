#!/usr/bin/env python3
"""Reversible D11H read-only extension to the already installed D11F probe.

Never edits a gameplay owner. Keeps exact bytes and newline conventions on rollback.
"""
from __future__ import annotations
import argparse, hashlib, json, sys
from pathlib import Path
ROOT = Path(__file__).resolve().parent
PROBE = ROOT/'src/debug/BOT1D11CDiagnosticProbe.js'
HELPER = ROOT/'src/debug/BOT1D11HFirstFootholdTimeline.js'
BACKUP_DIR = ROOT/'D11H_BACKUP_ORIGINALS'
BACKUP = BACKUP_DIR/'BOT1D11CDiagnosticProbe.js'
META = BACKUP_DIR/'manifest.json'
IMPORT_AFTER = 'import { inspectBOT1D11FAnchorContinuity } from "./BOT1D11FAnchorGeometryInspector.js";'
NEW_IMPORT = 'import { installBOT1D11HFirstFootholdTimeline } from "./BOT1D11HFirstFootholdTimeline.js";'
GUARD = '  if (window.__BLOB_D11C_PROBE__) return;'
RESET = 'reset() { samples.length = 0; interventions.length = 0; t0 = performance.now(); running = true; collect(); }'
DUMP = 'lastCell, exportedAt: new Date().toISOString() }; }'
STOP = 'stop() { running = false; clearInterval(interval); }'

def sha(b: bytes) -> str: return hashlib.sha256(b).hexdigest()
def patch(source: bytes) -> bytes:
    text = source.decode('utf-8')
    if NEW_IMPORT in text: raise ValueError('D11H already installed: do not apply twice')
    for snippet in (IMPORT_AFTER, GUARD, RESET, DUMP, STOP):
        if text.count(snippet) != 1: raise ValueError(f'D11F/D11C probe shape mismatch: {snippet[:60]}')
    eol = '\r\n' if b'\r\n' in source else '\n'
    text = text.replace(IMPORT_AFTER, IMPORT_AFTER + eol + NEW_IMPORT, 1)
    text = text.replace(GUARD, GUARD + eol + '  const d11h = installBOT1D11HFirstFootholdTimeline(runtime);', 1)
    text = text.replace(RESET, RESET.replace('collect();', 'd11h.reset(); collect();'), 1)
    text = text.replace(DUMP, 'lastCell, firstFoothold: d11h.dump(), exportedAt: new Date().toISOString() }; }', 1)
    text = text.replace(STOP, 'stop() { running = false; clearInterval(interval); d11h.stop(); }', 1)
    return text.encode('utf-8')

def main():
    p = argparse.ArgumentParser(description=__doc__)
    g = p.add_mutually_exclusive_group(required=True)
    for opt in ('check','apply','undo'): g.add_argument('--'+opt, action='store_true')
    args=p.parse_args()
    if args.undo:
        if not BACKUP.is_file() or not META.is_file(): raise ValueError('D11H backup/manifest missing')
        meta=json.loads(META.read_text())
        if not PROBE.is_file() or sha(PROBE.read_bytes()) != meta['patchedSha256']:
            raise ValueError('Current diagnostic was edited since D11H apply; refusing unsafe rollback')
        if sha(BACKUP.read_bytes()) != meta['originalSha256']: raise ValueError('Backup corrupted')
        PROBE.write_bytes(BACKUP.read_bytes())
        print('D11H diagnostic reverted byte-for-byte. D11F and gameplay untouched.')
        return
    if not PROBE.is_file() or not HELPER.is_file(): raise ValueError('D11F probe or D11H helper missing')
    original=PROBE.read_bytes()
    # A prior verified --undo may leave a pristine backup for safe reinstalls.
    reuse=False
    if BACKUP_DIR.exists():
        if not BACKUP.is_file() or not META.is_file(): raise ValueError('Incomplete D11H backup directory')
        meta=json.loads(META.read_text())
        if sha(BACKUP.read_bytes())!=meta['originalSha256']:
            raise ValueError('Saved D11H original has changed')
        if sha(original)==meta['patchedSha256']:
            print('D11H already installed and checksum verified. No change required.')
            return
        if sha(original)!=meta['originalSha256']:
            raise ValueError('Current probe differs from backed-up original; refusing reapply')
        reuse=True
    revised=patch(original)
    if reuse and sha(revised)!=meta['patchedSha256']:
        raise ValueError('Rebuilt D11H patch differs from previously verified patch')
    print('D11H preflight OK: read-only high-frequency probe extension; no gameplay owner edits')
    if args.check:return
    if not reuse:
        BACKUP_DIR.mkdir(parents=True,exist_ok=False)
        BACKUP.write_bytes(original)
    try:
        PROBE.write_bytes(revised)
        if not reuse:
            META.write_text(json.dumps({'originalSha256':sha(original),'patchedSha256':sha(revised)},indent=2),encoding='utf-8')
    except Exception:
        PROBE.write_bytes(original)
        raise
    print('D11H installed. Test-only. Roll back using py .\\D11H_APPLY.py --undo.')
if __name__=='__main__':
    try:main()
    except Exception as e:
        print('D11H STOPPED:',e,file=sys.stderr);raise SystemExit(1)
