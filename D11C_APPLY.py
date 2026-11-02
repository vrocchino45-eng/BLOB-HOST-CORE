#!/usr/bin/env python3
"""Install/uninstall BOT1-D11C dev-query diagnostic hook. Backups are mandatory."""
from __future__ import annotations
import argparse
from pathlib import Path
import shutil
import sys

ROOT = Path(__file__).resolve().parent
MAIN = ROOT / 'src/main.js'
PROBE = ROOT / 'src/debug/BOT1D11CDiagnosticProbe.js'
BACKUP = ROOT / '_D11C_BACKUP_ORIGINALS/main.js'
OLD = 'runtime.start().catch((error) => {'
NEW = '''// BOT1D11C: test-only, opt-in diagnostic. Normal gameplay boot remains unchanged.
runtime.start().then(async () => {
  if (import.meta.env.DEV && new URLSearchParams(window.location.search).get("bot1d11c") === "1") {
    const { installBOT1D11CProbe } = await import("./debug/BOT1D11CDiagnosticProbe.js");
    installBOT1D11CProbe(runtime);
  }
}).catch((error) => {'''

def main():
    p = argparse.ArgumentParser(description=__doc__)
    x = p.add_mutually_exclusive_group(required=True)
    x.add_argument('--check', action='store_true')
    x.add_argument('--apply', action='store_true')
    x.add_argument('--undo', action='store_true')
    args = p.parse_args()
    if args.undo:
        if not BACKUP.exists():
            raise RuntimeError('No original main.js backup; refusing to guess original source')
        if not MAIN.is_file() or NEW not in MAIN.read_text(encoding='utf-8'):
            raise RuntimeError('main.js has other edits or D11C marker missing; refusing destructive undo')
        shutil.copy2(BACKUP, MAIN)
        print('D11C hook reverted. Original main.js restored. Diagnostic module remains unused.')
        return
    if not MAIN.is_file() or not PROBE.is_file():
        raise RuntimeError('Place extracted D11C package in local BLOB-HOST-CORE project root (src/main.js required)')
    raw = MAIN.read_text(encoding='utf-8')
    if NEW in raw:
        raise RuntimeError('D11C hook already installed; do not apply twice')
    if raw.count(OLD) != 1:
        raise RuntimeError('Boot source changed: expected exactly one runtime.start().catch anchor')
    if BACKUP.exists():
        raise RuntimeError('Existing D11C backup; do not overwrite or reapply')
    print('D11C preflight OK: debug-query-gated boot hook; no movement/physics/chemistry owner changes')
    if args.check: return
    BACKUP.parent.mkdir(parents=True, exist_ok=False)
    shutil.copy2(MAIN, BACKUP)
    try: MAIN.write_text(raw.replace(OLD, NEW, 1), encoding='utf-8')
    except Exception:
        shutil.copy2(BACKUP, MAIN)
        raise
    print('D11C installed; backup _D11C_BACKUP_ORIGINALS/main.js; normal URL unaffected')

if __name__ == '__main__':
    try: main()
    except Exception as e:
        print('D11C STOPPED:', e, file=sys.stderr)
        raise SystemExit(1)
