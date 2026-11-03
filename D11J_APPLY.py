#!/usr/bin/env python3
"""Guarded, reversible BOT1-D11J single-owner change. No force option."""
from __future__ import annotations
import argparse, hashlib, json, os, pathlib, sys, tempfile
ROOT = pathlib.Path(__file__).resolve().parent
SPEC = ROOT / 'D11J_PATCH_OPERATIONS.json'
BACKUP_DIR = ROOT / 'D11J_BACKUP_ORIGINALS'
BACKUP = BACKUP_DIR / 'CoreTendrilSurfaceContactSystem.js'
RECORD = BACKUP_DIR / 'install_record.json'

def sha(b: bytes) -> str:
    return hashlib.sha256(b).hexdigest()

def replace_atomic(target: pathlib.Path, data: bytes) -> None:
    fd, name = tempfile.mkstemp(prefix='.d11j_', dir=target.parent)
    try:
        with os.fdopen(fd, 'wb') as f:
            f.write(data)
        os.replace(name, target)
    finally:
        if os.path.exists(name): os.unlink(name)

def candidate(data: bytes, doc: dict) -> bytes:
    decoded = data.decode('utf-8')
    if '\r\n' not in decoded or decoded.replace('\r\n','').find('\n') != -1:
        raise RuntimeError('expected CRLF source; refusing to normalize owner file')
    text = decoded.replace('\r\n','\n')
    for op in doc['operations']:
        count = text.count(op['before'])
        if count != 1:
            raise RuntimeError(f"edit '{op['label']}' matched {count} sections; not applying")
        text = text.replace(op['before'],op['after'],1)
    result = text.replace('\n','\r\n').encode('utf-8')
    if sha(result) != doc['patched_sha256']:
        raise RuntimeError('candidate output digest mismatch')
    return result

def main():
    a = argparse.ArgumentParser(description=__doc__)
    mode = a.add_mutually_exclusive_group(required=True)
    mode.add_argument('--check', action='store_true')
    mode.add_argument('--apply', action='store_true')
    mode.add_argument('--undo', action='store_true')
    args = a.parse_args()
    doc = json.loads(SPEC.read_text('utf-8'))
    target = ROOT / doc['source']
    if not target.is_file():
        raise RuntimeError(f'missing game owner: {target}')
    current = target.read_bytes(); current_sha = sha(current)
    if args.undo:
        if not BACKUP.is_file() or not RECORD.is_file():
            raise RuntimeError('no D11J backup/install record; cannot undo')
        record = json.loads(RECORD.read_text('utf-8'))
        if current_sha != doc['patched_sha256'] or record['patched_sha256'] != current_sha:
            raise RuntimeError('game owner changed after D11J install; refusing to overwrite later changes')
        old = BACKUP.read_bytes()
        if sha(old) != doc['source_sha256'] or sha(old) != record['baseline_sha256']:
            raise RuntimeError('backup integrity mismatch')
        replace_atomic(target, old)
        print('D11J: owner restored byte-for-byte. Backup retained.');return
    if current_sha == doc['patched_sha256']:
        print('D11J: already installed and digest verified.');return
    if current_sha != doc['source_sha256']:
        raise RuntimeError(f'current owner SHA {current_sha} differs from D11G baseline; upload current owner instead of forcing')
    patched = candidate(current, doc)
    print(f'D11J preflight PASS: {len(doc["operations"])} uniquely matched edits; correct CRLF and SHA-256.')
    if args.check: return
    if BACKUP_DIR.exists():
        raise RuntimeError('D11J backup folder already exists; refusing to overwrite it')
    BACKUP_DIR.mkdir()
    try:
        BACKUP.write_bytes(current)
        RECORD.write_text(json.dumps({'source':doc['source'],'baseline_sha256':current_sha,'patched_sha256':sha(patched)},indent=2)+'\n',encoding='utf-8')
        replace_atomic(target,patched)
    except Exception:
        if target.read_bytes() != current: replace_atomic(target,current)
        raise
    print('D11J installed: stride-handoff owner only. Backup: D11J_BACKUP_ORIGINALS/.')

if __name__ == '__main__':
    try: main()
    except Exception as e:
        print('D11J STOPPED:',e,file=sys.stderr);sys.exit(1)
