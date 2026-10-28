#!/usr/bin/env python3
"""Guarded BOT1-A -> BOT1-B harness-only patch. Never touches gameplay files."""
import argparse,hashlib,json,pathlib,shutil,sys

DELTA=pathlib.Path(__file__).resolve().parent
ROOT=DELTA.parent
PREFIX=pathlib.Path('BLOB_BOT1_REAL_INPUT_HARNESS/scripts')
SCRIPTS=['bot1_browser.py','analyze_bot1b.py','validate_bot1b_policy.py']
BACKUP=DELTA/'backups'/'bot1_browser.py'
ORIGINAL_SHA='d5153ceafa80b29c9eed9d9af7bdb3450d0c604d67c4d127def85392cbe581d9'
PATCH_SHAS={'bot1_browser.py': 'e8b63f841687763971100842d883b305d123059121917e65cc48ea90981e96d2', 'validate_bot1b_policy.py': 'c4028aab219f3f8dee5365eea47074b454073ee4ef507c9764b558d6f0b0dca0', 'analyze_bot1b.py': 'aa2b6f23efb34e07194b742f86e3dcf4c6f07f1e861b0f5c62bec6a490107772'}

def digest(content):
    txt=content.decode('utf-8-sig').replace('\r\n','\n').replace('\r','\n')
    return hashlib.sha256(txt.encode('utf-8')).hexdigest()

def state():
    statuses={}
    for n in SCRIPTS:
        target=ROOT/PREFIX/n
        if not target.exists():statuses[n]='MISSING';continue
        try:h=digest(target.read_bytes())
        except (UnicodeError,OSError):statuses[n]='DIFFERENT';continue
        if h==PATCH_SHAS[n]:statuses[n]='PATCHED'
        elif n=='bot1_browser.py' and h==ORIGINAL_SHA:statuses[n]='BASELINE'
        else:statuses[n]='DIFFERENT'
    if statuses['bot1_browser.py']=='BASELINE' and all(statuses[n]=='MISSING' for n in SCRIPTS[1:]): overall='BOT1A_READY'
    elif all(x=='PATCHED' for x in statuses.values()):overall='BOT1B_INSTALLED'
    else:overall='DIFFERENT'
    return overall,statuses

def main():
    p=argparse.ArgumentParser();group=p.add_mutually_exclusive_group(required=True)
    group.add_argument('--check',action='store_true');group.add_argument('--apply',action='store_true');group.add_argument('--revert',action='store_true')
    args=p.parse_args()
    overall,st=state();print(json.dumps({'result':overall,'files':st},indent=2))
    if args.check:return 0 if overall in ('BOT1A_READY','BOT1B_INSTALLED') else 2
    if args.apply:
        if overall=='BOT1B_INSTALLED':print('No change: already installed');return 0
        if overall!='BOT1A_READY':print('REFUSED: baseline drift or partial installation');return 2
        BACKUP.parent.mkdir(parents=True,exist_ok=True)
        shutil.copyfile(ROOT/PREFIX/SCRIPTS[0],BACKUP)
        if digest(BACKUP.read_bytes())!=ORIGINAL_SHA:print('REFUSED: backup checksum mismatch');return 2
        for n in SCRIPTS:
            src=DELTA/'payload'/PREFIX/n; dst=ROOT/PREFIX/n
            if digest(src.read_bytes())!=PATCH_SHAS[n]:print('REFUSED: payload drift',n);return 2
            dst.parent.mkdir(parents=True,exist_ok=True)
            dst.write_bytes(src.read_bytes())
        print('BOT1B_INSTALLED: bot harness scripts only. Gameplay untouched.')
        return 0
    if args.revert:
        if overall=='BOT1A_READY':print('Already reverted');return 0
        if overall!='BOT1B_INSTALLED' or not BACKUP.exists() or digest(BACKUP.read_bytes())!=ORIGINAL_SHA:
            print('REFUSED: source changed after patch or original backup unavailable');return 2
        (ROOT/PREFIX/SCRIPTS[0]).write_bytes(BACKUP.read_bytes())
        for n in SCRIPTS[1:]: (ROOT/PREFIX/n).unlink()
        print('BOT1A_RESTORED: original runner bytes restored; BOT1-B additions removed')
        return 0

if __name__=='__main__':sys.exit(main())
