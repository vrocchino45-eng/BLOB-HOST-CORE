#!/usr/bin/env python3
"""Reversible, diagnostic-only D11F extension of the existing D11C probe.

This edits ONLY src/debug/BOT1D11CDiagnosticProbe.js. No gameplay owner changes.
"""
from __future__ import annotations
import argparse, hashlib, json, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
PROBE = ROOT / 'src/debug/BOT1D11CDiagnosticProbe.js'
HELPER = ROOT / 'src/debug/BOT1D11FAnchorGeometryInspector.js'
BACKUP = ROOT / '_D11F_BACKUP_ORIGINALS/BOT1D11CDiagnosticProbe.js'
META = ROOT / '_D11F_BACKUP_ORIGINALS/checksums.json'
OLD_IMPORT = 'import * as THREE from "three";'
NEW_IMPORT = 'import { inspectBOT1D11FAnchorContinuity } from "./BOT1D11FAnchorGeometryInspector.js";'
OLD_ANCHOR = "      coreContactLanguage: { state: val(f.coreContactLanguage?.state, 'none') }"
NEW_ANCHOR = '      continuity: inspectBOT1D11FAnchorContinuity(runtime),\n' + OLD_ANCHOR

def digest(s: str) -> str:
    return hashlib.sha256(s.encode('utf-8')).hexdigest()

def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument('--check', action='store_true')
    group.add_argument('--apply', action='store_true')
    group.add_argument('--undo', action='store_true')
    args = parser.parse_args()
    if args.undo:
        if not BACKUP.is_file() or not META.is_file():
            raise RuntimeError('D11F backup/manifest unavailable; refusing rollback')
        checksums = json.loads(META.read_text(encoding='utf-8'))
        if digest(PROBE.read_text(encoding='utf-8')) != checksums['patchedSha256']:
            raise RuntimeError('D11C probe has changed since D11F installation; refusing unsafe overwrite')
        if digest(BACKUP.read_text(encoding='utf-8')) != checksums['originalSha256']:
            raise RuntimeError('D11F backup integrity mismatch')
        PROBE.write_bytes(BACKUP.read_bytes())
        print('D11F diagnostic reverted. D11C probe and gameplay remain intact.')
        return
    if not PROBE.is_file() or not HELPER.is_file():
        raise RuntimeError('D11C probe not installed or D11F helper missing; extract delta into the project root')
    raw = PROBE.read_text(encoding='utf-8')
    if NEW_IMPORT in raw or 'inspectBOT1D11FAnchorContinuity(runtime)' in raw:
        raise RuntimeError('D11F diagnostic already installed; do not apply twice')
    if raw.count(OLD_IMPORT) != 1 or raw.count(OLD_ANCHOR) != 1:
        raise RuntimeError('Unexpected D11C probe version; do not overwrite modified diagnostic')
    if BACKUP.exists() or META.exists():
        raise RuntimeError('D11F backup already exists; refusing overwrite')
    patched = raw.replace(OLD_IMPORT, OLD_IMPORT + '\n' + NEW_IMPORT, 1).replace(OLD_ANCHOR, NEW_ANCHOR, 1)
    print('D11F preflight OK: existing D11C probe found; only read-only per-anchor geometry will be added')
    if args.check: return
    BACKUP.parent.mkdir(parents=True, exist_ok=False)
    BACKUP.write_bytes(PROBE.read_bytes())
    try:
        PROBE.write_text(patched, encoding='utf-8')
        META.write_text(json.dumps({'originalSha256':digest(raw),'patchedSha256':digest(patched)}, indent=2), encoding='utf-8')
    except Exception:
        PROBE.write_bytes(BACKUP.read_bytes())
        raise
    print('D11F installed. D11C hook unchanged; D11D contact code unchanged. Reversible using --undo.')

if __name__ == '__main__':
    try: main()
    except Exception as exc:
        print('D11F STOPPED:', exc, file=sys.stderr)
        raise SystemExit(1)
