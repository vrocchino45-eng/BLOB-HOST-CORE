#!/usr/bin/env python3
"""D11G line-ending-safe rebase, pinned to user-provided current owner.

Only edits src/player/CoreTendrilSurfaceContactSystem.js. Preconditions:
- owner matches exact uploaded SHA256 and CRLF form;
- every one of the 11 replacement contexts matches exactly once;
- resulting file matches the packaged post-patch SHA256.

Reversible via --undo only when post-patch owner is byte-identical.
"""
from __future__ import annotations
import argparse
import hashlib
import json
import os
from pathlib import Path
import sys
import tempfile

ROOT = Path(__file__).resolve().parent
DOC = ROOT / 'D11G_REBASE_PATCH_OPERATIONS.json'
BACKUP_DIR = ROOT / 'D11G_REBASE_BACKUP_ORIGINALS'
BACKUP = BACKUP_DIR / 'CoreTendrilSurfaceContactSystem.js'
RECORD = BACKUP_DIR / 'install.json'


def digest(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def render(baseline: bytes, doc: dict) -> bytes:
    if doc.get('source_eol') != 'CRLF' or b'\r\n' not in baseline or b'\n' in baseline.replace(b'\r\n', b''):
        raise RuntimeError('source line endings are not the validated CRLF baseline')
    s = baseline.decode('utf-8')
    for op in doc['operations']:
        before = op['before'].replace('\n', '\r\n')
        after = op['after'].replace('\n', '\r\n')
        found = s.count(before)
        if found != 1:
            raise RuntimeError(f'edit {op["label"]!r} expected once, found {found}')
        s = s.replace(before, after, 1)
    candidate = s.encode('utf-8')
    if digest(candidate) != doc['patched_sha256']:
        raise RuntimeError('post-patch SHA mismatch; nothing installed')
    if b'\n' in candidate.replace(b'\r\n', b''):
        raise RuntimeError('patch unexpectedly changed the line-ending convention')
    return candidate


def atomic_replace(target: Path, data: bytes):
    tmp = None
    try:
        with tempfile.NamedTemporaryFile(mode='wb', dir=target.parent, prefix='.d11g_', suffix='.tmp', delete=False) as f:
            tmp = Path(f.name)
            f.write(data)
            f.flush()
            os.fsync(f.fileno())
        os.replace(tmp, target)
    finally:
        if tmp and tmp.exists():
            tmp.unlink()


def main():
    p = argparse.ArgumentParser(description=__doc__)
    a = p.add_mutually_exclusive_group(required=True)
    a.add_argument('--check', action='store_true')
    a.add_argument('--apply', action='store_true')
    a.add_argument('--undo', action='store_true')
    args = p.parse_args()
    doc = json.loads(DOC.read_text(encoding='utf-8'))
    target = ROOT / doc['source']
    if not target.is_file():
        raise RuntimeError(f'expected source owner missing: {target}')
    current = target.read_bytes()
    current_sha = digest(current)
    if args.undo:
        if not BACKUP.is_file() or not RECORD.is_file():
            raise RuntimeError('no D11G rebase backup and install record; cannot undo')
        record = json.loads(RECORD.read_text(encoding='utf-8'))
        if current_sha != record['patched_sha256'] or record['patched_sha256'] != doc['patched_sha256']:
            raise RuntimeError('current owner differs from D11G rebase output; refusing to overwrite later work')
        original = BACKUP.read_bytes()
        if digest(original) != record['baseline_sha256'] or record['baseline_sha256'] != doc['source_sha256']:
            raise RuntimeError('backup integrity failed; no changes made')
        atomic_replace(target, original)
        print('D11G REBASE: restored original source byte-for-byte; backups retained.')
        return
    if current_sha == doc['patched_sha256']:
        if args.check:
            print('D11G REBASE: already installed; patched SHA verified.')
            return
        raise RuntimeError('repair already installed; not applying twice')
    if current_sha != doc['source_sha256']:
        raise RuntimeError(f'owner SHA differs from uploaded user baseline ({current_sha}); no changes made')
    candidate = render(current, doc)
    if BACKUP_DIR.exists():
        raise RuntimeError('rebase backup directory already exists; refusing to overwrite evidence')
    print(f'D11G REBASE preflight PASS: uploaded-owner hash; {len(doc["operations"])} unique edits; CRLF and output hash verified.')
    if args.check:
        return
    BACKUP_DIR.mkdir()
    try:
        BACKUP.write_bytes(current)
        RECORD.write_text(json.dumps({
            'source': doc['source'],
            'baseline_sha256': doc['source_sha256'],
            'patched_sha256': doc['patched_sha256'],
            'source_eol': 'CRLF',
            'patch_revision': doc['patch_revision']
        }, indent=2) + '\n', encoding='utf-8')
        atomic_replace(target, candidate)
    except Exception:
        if target.read_bytes() != current:
            atomic_replace(target, current)
        raise
    print('D11G REBASE applied to tendril contact owner only. Backup in D11G_REBASE_BACKUP_ORIGINALS/.')


if __name__ == '__main__':
    try:
        main()
    except Exception as exc:
        print('D11G REBASE STOPPED:', exc, file=sys.stderr)
        sys.exit(1)
