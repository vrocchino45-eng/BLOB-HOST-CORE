import { readLocalChemistryContext } from '../chemistry/LocalChemistryContextSystem.js';

// CONNECTION33 restores one visible material's existing response chain first.
// No chemistry coefficient, new verb, entity response, or progression authority.
export const SURFACE_MATERIAL_RESPONSE_SCOPE = Object.freeze({
  cellId: 'CELL_MEMBRANE_NURSERY_001',
  objectIds: Object.freeze(['scar_contamination_plate_001'])
});

export function materialInScope(item, scope) {
  return !scope || Boolean(item?.cellId === scope.cellId
    && scope.objectIds.includes(item?.recipe?.id));
}

export function materialVisible(item) {
  if (!item?.root || item.absorbed || item.root.userData?.absorbed) return false;
  for (let node = item.root; node; node = node.parent) if (!node.visible) return false;
  return true;
}

export function materialScopeActive(f, scope) {
  if (!scope) return true; // Preserve standalone legacy owner fixtures.
  const execution = f.runtimeExecution;
  return f.activeCellId === scope.cellId && Boolean(readLocalChemistryContext(f))
    && !f.inspectionCamera?.active && !f.inspectionCamera?.coreWorkActive
    && !f.tightInspectionCamera?.active && !f.tightInspectionCamera?.coreWorkActive
    && execution?.frame === f.frame
    && execution.executedSystemIds?.includes('targetingSystem')
    && execution.executedSystemIds?.includes('verbCompositionSystem');
}
