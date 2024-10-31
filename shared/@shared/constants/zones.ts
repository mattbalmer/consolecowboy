import { Zone } from '@shared/types/game';
import { generate } from '@shared/utils/arrays';

export const Zones: Record<string, Zone> = {
  chiba: {
    id: 'chiba',
    name: 'Tokyo > Chiba',
    description: 'A gloomy district of Tokyo',
    levels: generate(10, i => `${i + 1}`),
    vendors: [],
    adjacent: ['shinjuku'],
    canVisit: () => true,
  },
  shinjuku: {
    id: 'shinjuku',
    name: 'Tokyo > Shinjuku',
    description: 'A bustling district of Tokyo',
    levels: generate(10, i => `${i + 11}`),
    vendors: ['Johnny'],
    adjacent: ['chiba'],
    canVisit: (player) => player.history['10']?.[1] > 0,
  },
};
export type ZoneID = keyof typeof Zones;

export const DEFAULT_ZONE = 'chiba' as ZoneID;