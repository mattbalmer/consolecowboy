import { Zone } from '@shared/types/game';
import { OverworldController } from '@overworld/controllers/base';
import { OverworldState } from '@overworld/hooks/use-overworld';
import { OverworldPage } from '@overworld/types';

// TODO: make async and import only necessary files later
export const OverworldControllers = {
  // 'overworld': require('@overworld/controllers/zones/chiba').default, // todo: remove when all zoned up
  'zone.chiba': require('@overworld/controllers/zones/chiba').default,
} as Record<string, OverworldController>;

export const getOverworldControllerFor = (page: OverworldPage, zoneID?: Zone['id']): OverworldController => {
  const combined = [page, zoneID].filter(_ => !!_).join('.');
  if (OverworldControllers.hasOwnProperty(combined)) {
    return OverworldControllers[combined];
  } else {
    return null;
  }
}

export const useOverworldController = (page: OverworldPage, zoneID: Zone['id'], state: OverworldState) => {
  const useController = getOverworldControllerFor(page, zoneID);
  console.log('overworld controller', page, zoneID, useController);
  if (useController) {
    return useController(state);
  }
}