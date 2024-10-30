import { Zone } from '@shared/types/game';
import { generate } from '@shared/utils/arrays';

export const Zones: Record<string, Zone> = {
  chiba: {
    id: 'chiba',
    name: 'Chiba',
    description: 'A gloomy district of Tokyo',
    levels: generate(10, i => `${i}`),
    vendors: ['Johnny'],
    adjacent: [],
    canVisit: () => true,
  },
};
export type ZoneID = keyof typeof Zones;

export const DEFAULT_ZONE = 'chiba' as ZoneID;