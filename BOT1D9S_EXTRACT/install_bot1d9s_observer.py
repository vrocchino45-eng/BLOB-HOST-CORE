#!/usr/bin/env python3
"""G1-D9S guarded, reversible recorder-only insertion (no gameplay logic changes)."""
from __future__ import annotations
import argparse, pathlib, sys

RELATIVE = pathlib.Path('src/debug/WorldObjectCensusSystem.js')
TAG = 'G1-D9S-NEUTRAL-REC1-v1'
ANCHOR = '    const requestActive = rawMagnitude >= 0.55 || m.inputMagnitude >= 0.55;'
RESET_ANCHOR = 'this.mobLastSampleMs=null;'
INSERT = '''
    // G1-D9S-NEUTRAL-REC1-v1: read-only neutral owner heartbeat for calibration.
    // No movement, targeting, player or Fold state is changed by this observer.
    if (!requestActive && (!Number.isFinite(this.mobD9SNeutralLastSampleMs) || now - this.mobD9SNeutralLastSampleMs >= 400)) {
      this.mobD9SNeutralLastSampleMs = now;
      this.recordEvent('g1d9s-neutral-movement-observation', {
        owner: current,
        observationOnly: true,
        caveat: 'Read-only 400ms neutral sample for D9S; camera input may occur, ambient drift remains possible. Not a gameplay receipt.'
      });
    }
'''
RESET_INSERT = ' this.mobD9SNeutralLastSampleMs=null;'  # reset alongside existing capture timer state

def patch_text(src: str) -> tuple[str, str]:
    if TAG in src:
        if 'g1d9s-neutral-movement-observation' in src and RESET_INSERT.strip() in src:
            return src, 'ALREADY_INSTALLED'
        raise ValueError('Partial D9S instrumentation detected: refusing to overwrite')
    if src.count(ANCHOR) != 1 or src.count(RESET_ANCHOR) != 1:
        raise ValueError('Expected C0D4-MOB1 recorder anchors not found exactly once; no file changed')
    if 'sampleMobility()' not in src or 'this.recordEvent(\'c0d4-mob1-movement-sample\'' not in src:
        raise ValueError('Unexpected recorder implementation; no file changed')
    return src.replace(ANCHOR, ANCHOR+INSERT, 1).replace(RESET_ANCHOR, RESET_ANCHOR+RESET_INSERT,1), 'INSTALLED'

def install(root: pathlib.Path) -> str:
    dest=root/RELATIVE
    if not dest.is_file(): raise FileNotFoundError(f'Cannot find {RELATIVE} in {root}')
    original=dest.read_bytes()
    try: source=original.decode('utf-8')
    except UnicodeDecodeError as e: raise ValueError('Unexpected recorder encoding; no file changed') from e
    patched,result=patch_text(source)
    if result=='ALREADY_INSTALLED':return result
    backup=dest.with_suffix(dest.suffix+'.preD9S.bak')
    if backup.exists():
        if backup.read_bytes()!=original: raise ValueError(f'Old backup exists and differs: {backup}; no file changed')
    else:
        backup.write_bytes(original)
    dest.write_text(patched,encoding='utf-8',newline='')
    return f'INSTALLED (backup {backup})'

def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--root',type=pathlib.Path,default=pathlib.Path.cwd(),help='BLOB-HOST-CORE repo root')
    p.add_argument('--check',action='store_true',help='Check instrumentation exists without editing')
    p.add_argument('--restore',action='store_true',help='Restore exact pre-D9S backup if installed')
    a=p.parse_args();dst=a.root/RELATIVE; backup=dst.with_suffix(dst.suffix+'.preD9S.bak')
    try:
        if a.check:
            src=dst.read_text(encoding='utf-8')
            if TAG not in src or 'g1d9s-neutral-movement-observation' not in src:
                raise ValueError('D9S instrumentation not installed')
            print('D9S_OBSERVER_INSTALLED: recorder neutral event enabled');return 0
        if a.restore:
            if not backup.exists(): raise FileNotFoundError('Backup missing, nothing restored')
            if TAG not in dst.read_text(encoding='utf-8'):
                raise ValueError('Recorder no longer has D9S tag; refuse to restore automatically')
            dst.write_bytes(backup.read_bytes());print('RESTORED_PRE_D9S_BACKUP');return 0
        print(install(a.root));return 0
    except (OSError,ValueError) as e:
        print('D9S_INSTALL_REFUSED:',e,file=sys.stderr);return 2
if __name__=='__main__':raise SystemExit(main())
