#!/usr/bin/env python3
"""Guarded installation and byte-identical rollback of BOT1-D11G.

Edits only src/player/CoreTendrilSurfaceContactSystem.js. It requires the
supplied BOT0 owner's exact SHA, so no unreviewed local changes are overwritten.
"""
from __future__ import annotations
import argparse
import hashlib
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
PATCH_PATH = ROOT / 'D11G_PATCH_OPERATIONS.json'
BACKUP_ROOT = ROOT / 'D11G_BACKUP_ORIGINALS'
BACKUP = BACKUP_ROOT / 'CoreTendrilSurfaceContactSystem.js'
RECORD = BACKUP_ROOT / 'install.json'


def digest(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def render_patch(baseline: bytes, doc: dict) -> bytes:
    text = baseline.decode('utf-8')
    for operation in doc['operations']:
        before, after = operation['before'], operation['after']
        n = text.count(before)
        if n != 1:
            raise RuntimeError(f"ambiguous operation {operation['label']!r}: {n} occurrences")
        text = text.replace(before, after, 1)
    result = text.encode('utf-8')
    if digest(result) != doc['patched_sha256']:
        raise RuntimeError('D11G patch-content hash mismatch')
    return result


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    action = ap.add_mutually_exclusive_group(required=True)
    action.add_argument('--check', action='store_true')
    action.add_argument('--apply', action='store_true')
    action.add_argument('--undo', action='store_true')
    args = ap.parse_args()
    doc = json.loads(PATCH_PATH.read_text(encoding='utf-8'))
    target = ROOT / doc['source']
    if not target.is_file():
        raise RuntimeError(f'expected active owner absent: {target}')
    content = target.read_bytes()
    current = digest(content)

    if args.undo:
        if not BACKUP.is_file() or not RECORD.is_file():
            raise RuntimeError('missing D11G backup or install record; no rollback performed')
        record = json.loads(RECORD.read_text(encoding='utf-8'))
        if current != record['patched_sha256']:
            raise RuntimeError('owner changed since D11G installation; refusing destructive rollback')
        original = BACKUP.read_bytes()
        if digest(original) != record['baseline_sha256']:
            raise RuntimeError('backup hash mismatch; refusing destructive rollback')
        target.write_bytes(original)
        # Backups deliberately retained for provenance; --apply must not overwrite them.
        print('D11G owner restored byte-for-byte. Backup retained; do not re-apply without archiving the backup.')
        return

    if current == doc['patched_sha256']:
        if args.check:
            print('D11G already installed; source hash verified.')
            return
        raise RuntimeError('D11G already installed; refusing a second installation')
    if current != doc['source_sha256']:
        raise RuntimeError('owner SHA differs from supplied baseline; refusing speculative patch. Re-audit the current source.')
    candidate = render_patch(content, doc)
    if BACKUP_ROOT.exists():
        raise RuntimeError('D11G backup folder already exists; refusing overwrite')
    print('D11G preflight PASS: exact owner baseline, 11 unique edits, patched hash verified.')
    if args.check:
        return
    BACKUP_ROOT.mkdir()
    BACKUP.write_bytes(content)
    try:
        target.write_bytes(candidate)
        record = {
            'source': doc['source'],
            'baseline_sha256': doc['source_sha256'],
            'patched_sha256': doc['patched_sha256'],
            'owner_only': True
        }
        RECORD.write_text(json.dumps(record, indent=2) + '\n', encoding='utf-8')
    except Exception:
        target.write_bytes(content)
        raise
    print('D11G owner patch installed. No movement, Silt, chemistry, or Fold files modified.')


if __name__ == '__main__':
    try:
        main()
    except Exception as exc:
        print('D11G STOPPED:', exc, file=sys.stderr)
        raise SystemExit(1)
