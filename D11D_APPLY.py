#!/usr/bin/env python3
"""Reversible narrowly scoped BOT1-D11D CoreEmbodiment contact bootstrap."""
import argparse
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
TARGET = ROOT / "src/player/CoreEmbodimentSystem.js"
HELPER = ROOT / "src/player/CoreAuthoredContactBootstrap.js"
BACKUP = ROOT / "D11D_BACKUP_ORIGINALS/CoreEmbodimentSystem.js"
MANIFEST = ROOT / "D11D_INSTALLED_MANIFEST.json"
IMPORT = 'import { canBeginAuthoredSurfaceBrush } from "./CoreAuthoredContactBootstrap.js";\n'
ANCHOR1 = 'import * as THREE from "three";\n'
ANCHOR2 = '    const physicalAttachment = frameState.playerAttachment ?? {};\n    const physicalAttachmentActive = physicalAttachment.active === true;\n'
BLOCK2 = """    // BOT1-D11D: this is only first-touch brushing, not a mechanical latch.
    // A registered surface must be close and the Core must not be peeling away.
    // Tendril sealing -> support plane -> movement attachment keep their owners.
    const authoredSurfaceBrushReady = canBeginAuthoredSurfaceBrush({
      surfaceTruth,
      kinematics,
      physicalAttachment,
      coreWorkActive
    });
"""
ANCHOR3 = """      } else if (grazingBoundary) {
        nextState = "brushing";
      } else if (this.coreContactState === "releasing" && this.coreContactReleaseAge < 0.46) {
"""
BLOCK3 = """      } else if (grazingBoundary) {
        nextState = "brushing";
      } else if (authoredSurfaceBrushReady) {
        // Registered, near contact can initiate the first reaching tendril.
        // The visual "attached" state remains reserved for physicalAttachment.
        nextState = "brushing";
      } else if (this.coreContactState === "releasing" && this.coreContactReleaseAge < 0.46) {
"""

def sha(data): return hashlib.sha256(data).hexdigest()

def patch(original):
    for target,count in ((ANCHOR1,1),(ANCHOR2,1),(ANCHOR3,1)):
        if original.count(target)!=count:
            raise RuntimeError("Cannot safely identify exact source anchor; project differs from expected HC build. No changes made.")
    return original.replace(ANCHOR1,ANCHOR1+IMPORT,1).replace(ANCHOR2,ANCHOR2+BLOCK2,1).replace(ANCHOR3,BLOCK3,1)

def main():
    arg=argparse.ArgumentParser()
    group=arg.add_mutually_exclusive_group(required=True)
    group.add_argument('--check',action='store_true')
    group.add_argument('--apply',action='store_true')
    group.add_argument('--undo',action='store_true')
    opts=arg.parse_args()
    if not TARGET.exists() or not HELPER.exists(): raise SystemExit('D11D missing source/helper; extract delta into project root first.')
    if opts.undo:
        if not BACKUP.exists() or not MANIFEST.exists(): raise SystemExit('D11D backup/manifest missing; cannot safely undo.')
        manifest=json.loads(MANIFEST.read_text()); current=TARGET.read_bytes()
        if sha(current)!=manifest['patched_sha256']: raise SystemExit('D11D source changed after installation; refusing to overwrite user changes.')
        backup=BACKUP.read_bytes()
        if sha(backup)!=manifest['original_sha256']: raise SystemExit('D11D backup integrity mismatch.')
        TARGET.write_bytes(backup)
        MANIFEST.unlink()
        print('D11D rolled back: embodiment source restored byte-for-byte. The added pure helper remains inert.')
        return
    current=TARGET.read_text(encoding='utf8')
    if MANIFEST.exists():
        m=json.loads(MANIFEST.read_text())
        if sha(current.encode())==m['patched_sha256']:
            print('D11D already applied; no action.');return
        raise SystemExit('D11D installed manifest exists but source differs. Refusing additional changes.')
    candidate=patch(current)
    print('D11D preflight OK: exact HC contact-language anchors and local helper found.')
    print('D11D scope: one CoreEmbodimentSystem change; no PlayerMovementController, Silt, Guide, chemistry edits.')
    if opts.check:return
    BACKUP.parent.mkdir(parents=True,exist_ok=True)
    if BACKUP.exists():
        if BACKUP.read_bytes() != current.encode():
            raise SystemExit('D11D backup differs from current unpatched source; refusing to overwrite.')
        print('D11D matching original backup found; preserving it for this re-install.')
    else:
        BACKUP.write_bytes(current.encode())
    TARGET.write_text(candidate,encoding='utf8',newline='\n')
    m={'original_sha256':sha(current.encode()),'patched_sha256':sha(candidate.encode()),'target':'src/player/CoreEmbodimentSystem.js'}
    MANIFEST.write_text(json.dumps(m,indent=2)+'\n')
    print('D11D applied. Backup saved at D11D_BACKUP_ORIGINALS/CoreEmbodimentSystem.js')
    print('Run: node scripts/testBOT1D11DAuthoredContactBootstrap.mjs')
if __name__=='__main__':main()
