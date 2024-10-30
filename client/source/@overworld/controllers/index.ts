import { Zone } from '@shared/types/game';
import { OverworldController } from '@overworld/controllers/base';
import { OverworldPage } from '@overworld/types';

// TODO: make async and import only necessary files later
export const OverworldControllers = {
  // 'overworld': require('@overworld/controllers/zones/chiba').default, // todo: remove when all zoned up
  'zone.chiba': require('@overworld/controllers/zones/chiba').default,
} as Record<string, new () => OverworldController>;

export const getOverworldControllerFor = (page: OverworldPage, zoneID?: Zone['id']): OverworldController => {
  const combined = [page, zoneID].filter(_ => !!_).join('.');
  if (OverworldControllers.hasOwnProperty(combined)) {
    const controller = new OverworldControllers[combined];
    controller?.onBind?.({ page, zoneID });
    return controller;
  } else {
    return null;
  }
}