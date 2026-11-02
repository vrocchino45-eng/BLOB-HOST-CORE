#!/usr/bin/env python3
"""BLOB BOT1-D11B narrow, reversible authored Silt surface registration."""
from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path
import shutil
import sys

ROOT = Path(__file__).resolve().parent
ROUTE = ROOT / 'src/routes/SiltPressureRouteSystem.js'
RECIPE = ROOT / 'public/data/routes/siltPressureRouteCircuit_HC012A.json'
MARKER = 'BOT1D11B'
BACKUP_DIR = ROOT / '_D11B_BACKUP_ORIGINALS'

IMPORT_OLD = 'import { SiltLivingMaterialCycle } from "./SiltLivingMaterialCycle.js";'
IMPORT_NEW = 'import { applyCrawlableSurfaceMetadata } from "../world/CrawlableSurfaceRegistry.js";'
CONSTRUCTOR_OLD = '    this.siltContactMesh = null;'
CONSTRUCTOR_NEW = '    this.hcCrawlableSurfaceMeshes = [];'
CREATION_OLD = '    this.createSiltContactPatch();'
CREATION_NEW = '    this.createHCCrawlableSurfaces();'
METHOD_BEFORE = '  // D2J: the one deliberately contactable *Silt sediment* patch, located'
METHOD = '''  // BOT1D11B: a single explicit HC-profile contact proof on a *new* Silt
  // sediment shelf. Existing LS1A caverns, geologic walls and material-contact
  // patches remain visual-only / separately owned; never wholesale-tag them.
  // Root anchoring and current cell visibility are owned by this route.
  createHCCrawlableSurfaces() {
    const proof = this.recipe?.hcCrawlableSurfaceProof;
    if (proof?.pass !== "BOT1D11B") return;
    for (const definition of proof.surfaces ?? []) {
      const material = this.trackMaterial(new THREE.MeshStandardMaterial({
        color: definition.color ?? 0x88684c,
        emissive: 0x32251b,
        emissiveIntensity: 0.15,
        roughness: 0.96,
        transparent: true,
        opacity: 0.75,
        depthWrite: false
      }));
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 14), material);
      mesh.name = `silt_crawlable_${definition.id.toLowerCase()}`;
      mesh.position.fromArray(definition.position);
      mesh.scale.fromArray(definition.scale);
      applyCrawlableSurfaceMetadata(mesh, {
        surfaceId: definition.id,
        profileId: definition.profileId,
        cellId: ROUTE_CELL_ID,
        contactPriority: definition.contactPriority ?? 0.08,
        regionalRole: "silt_entry_sediment_contact_proof"
      });
      mesh.userData.siltCrawlableProofPass = "BOT1D11B";
      mesh.userData.siltGeometryOwnership = "new_authored_contact_surface_not_original_visual_only_geology";
      this.root.add(mesh);
      this.hcCrawlableSurfaceMeshes.push(mesh);
    }
  }

'''
PROOF = {
    'pass': 'BOT1D11B',
    'status': 'experimental_positive_control_not_locked',
    'authority': 'SiltPressureRouteSystem_authored_ecological_contact_mesh',
    'originalLS1AHabitatFoundationRemainsVisualOnly': True,
    'noMovementPhysicsChanges': True,
    'surfaces': [
        {
            'id': 'SILT_ENTRY_SEDIMENT_SHELF_D11B',
            'profileId': 'residue_weak',
            'position': [-0.18, -0.75, -2.65],
            'scale': [1.35, 0.24, 0.95],
            'contactPriority': 0.08,
            'color': 0x8c6d4b,
            'role': 'deliberate_near_entry_crawlable_contact_proof'
        }
    ],
}


def exactly_once(s: str, anchor: str, label: str) -> None:
    n = s.count(anchor)
    if n != 1:
        raise ValueError(f'{label}: expected one insertion anchor, found {n}; no changes made')


def plan() -> tuple[str, str]:
    if not ROUTE.is_file() or not RECIPE.is_file():
        raise FileNotFoundError('Put this script in the BLOB-HOST-CORE project root; required src/ and public/ files not found')
    source = ROUTE.read_text(encoding='utf-8')
    raw = RECIPE.read_text(encoding='utf-8')
    if MARKER in source or 'hcCrawlableSurfaceProof' in raw:
        raise ValueError('D11B markers already present. No duplicate patch will be applied.')
    for anchor, label in [(IMPORT_OLD, 'import'), (CONSTRUCTOR_OLD, 'constructor'), (CREATION_OLD, 'builder'), (METHOD_BEFORE, 'method')]:
        exactly_once(source, anchor, label)
    data = json.loads(raw)
    if data.get('habitatFoundation', {}).get('addsContactSurfaces') is not False:
        raise ValueError('Expected original LS1A visual-only habitat contract; source differs')
    if data.get('anatomy', {}).get('pathPoints', [None])[0] != [0.0, -0.04, 0.45]:
        raise ValueError('Silt entry geometry differs from tested archive; rebaseline before patching')
    source = source.replace(IMPORT_OLD, IMPORT_OLD + '\n' + IMPORT_NEW, 1)
    source = source.replace(CONSTRUCTOR_OLD, CONSTRUCTOR_OLD + '\n' + CONSTRUCTOR_NEW, 1)
    source = source.replace(CREATION_OLD, CREATION_OLD + '\n' + CREATION_NEW, 1)
    source = source.replace(METHOD_BEFORE, METHOD + METHOD_BEFORE, 1)
    # Add a new independent authored proof, not changes to the original LS1A anatomy contract.
    insert_at = raw.rfind('\n}')
    if insert_at < 0:
        raise ValueError('Recipe root closing brace missing')
    newline = ',\n  "hcCrawlableSurfaceProof": ' + json.dumps(PROOF, indent=2).replace('\n', '\n  ')
    raw = raw[:insert_at] + newline + raw[insert_at:]
    assert json.loads(raw)['hcCrawlableSurfaceProof']['surfaces'][0]['profileId'] == 'residue_weak'
    return source, raw


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument('--check', action='store_true', help='verify preconditions only')
    group.add_argument('--apply', action='store_true', help='backup and apply two focused file edits')
    group.add_argument('--undo', action='store_true', help='restore the two pre-D11B backups')
    args = parser.parse_args()

    if args.undo:
        if not BACKUP_DIR.is_dir():
            raise FileNotFoundError('No D11B backups found')
        for path, label in [(ROUTE, 'SiltPressureRouteSystem.js'), (RECIPE, 'siltPressureRouteCircuit_HC012A.json')]:
            original = BACKUP_DIR / label
            if not original.is_file():
                raise FileNotFoundError(f'Missing D11B backup {label}')
            shutil.copy2(original, path)
        print('D11B original route and recipe restored from backups. Run the existing validators.')
        return

    source, raw = plan()
    print('D11B preflight OK: expected Silt source and visual-only LS1A recipe confirmed.')
    print('D11B will author ONE residue_weak crawlable shelf, preserving movement/chemistry/Guide owners.')
    if args.check:
        return
    if BACKUP_DIR.exists():
        raise FileExistsError(f'{BACKUP_DIR} exists; avoid overwriting originals')
    BACKUP_DIR.mkdir()
    shutil.copy2(ROUTE, BACKUP_DIR / ROUTE.name)
    shutil.copy2(RECIPE, BACKUP_DIR / RECIPE.name)
    try:
        ROUTE.write_text(source, encoding='utf-8')
        RECIPE.write_text(raw, encoding='utf-8')
    except Exception:
        shutil.copy2(BACKUP_DIR / ROUTE.name, ROUTE)
        shutil.copy2(BACKUP_DIR / RECIPE.name, RECIPE)
        raise
    print('D11B applied. Backups stored in _D11B_BACKUP_ORIGINALS/.')
    print('Next: node scripts/validateBOT1D11BSiltSurface.mjs')


if __name__ == '__main__':
    try:
        main()
    except (OSError, ValueError, json.JSONDecodeError) as ex:
        print(f'D11B STOPPED: {ex}', file=sys.stderr)
        raise SystemExit(1)
