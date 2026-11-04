#!/usr/bin/env python3
"""D11M Windows newline test-fixture correction, no runtime changes."""
from __future__ import annotations
import argparse, hashlib, sys
from pathlib import Path
ROOT=Path(__file__).resolve().parent
TARGET=ROOT/'BLOB_BOT1_REAL_INPUT_HARNESS/scripts/test_bot1d11m.py'
PAYLOAD=ROOT/'D11M_TEST_FIX_PAYLOAD/test_bot1d11m.py'
BACKUP=ROOT/'D11M_TEST_FIX_BACKUP/test_bot1d11m.py'
ORIGINAL_SHA='3ae4951c149957a5b52ba5aaf876273b2e75d274579cc94dde2bb170b15ac2ed'
FIXED_SHA='462dd729f090d5d6371b9f5078525de85deceec976ef3001cbe55fb46002d1c2'

def sha(path): return hashlib.sha256(path.read_bytes()).hexdigest()

def run():
    p=argparse.ArgumentParser(description=__doc__)
    group=p.add_mutually_exclusive_group(required=True)
    for opt in ('check','apply','undo'):group.add_argument('--'+opt,action='store_true')
    args=p.parse_args()
    if not TARGET.is_file():raise ValueError('D11M test file not found in project root')
    existing=sha(TARGET)
    if args.undo:
        if not BACKUP.is_file() or sha(BACKUP)!=ORIGINAL_SHA:raise ValueError('Original test backup missing or changed')
        if existing!=FIXED_SHA:raise ValueError('Test was modified after fix; refusing unsafe undo')
        TARGET.write_bytes(BACKUP.read_bytes())
        print('D11M test-only correction undone; gameplay unchanged.')
        return
    if not PAYLOAD.is_file() or sha(PAYLOAD)!=FIXED_SHA:raise ValueError('Hotfix payload missing or invalid')
    if existing==FIXED_SHA:
        print('D11M test hotfix already installed; no changes.')
        return
    if existing!=ORIGINAL_SHA:raise ValueError('Unexpected D11M test version; refusing overwrite')
    if BACKUP.exists() and sha(BACKUP)!=ORIGINAL_SHA:raise ValueError('Existing backup differs; refusing overwrite')
    print('D11M test-only correction check passed.')
    if args.check:return
    BACKUP.parent.mkdir(exist_ok=True)
    if not BACKUP.exists():BACKUP.write_bytes(TARGET.read_bytes())
    TARGET.write_bytes(PAYLOAD.read_bytes())
    if sha(TARGET)!=FIXED_SHA:raise RuntimeError('Verification after installation failed')
    print('Fixed D11M test fixture installed. D11M runtime probe and gameplay unchanged.')
if __name__=='__main__':
    try:run()
    except Exception as err:
        print('D11M TEST FIX STOPPED:',err,file=sys.stderr)
        raise SystemExit(1)
