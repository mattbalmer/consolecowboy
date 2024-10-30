import { Zone } from '@shared/types/game';
import { generate } from '@shared/utils/arrays';

export const Zones = {
  chiba: {
    id: 'chiba',
    name: 'Chiba',
    description: 'A gloomy district of Tokyo',
    levels: generate(10, i => `${i}`),
    vendors: ['Johnny'],
    adjacent: [],
    canVisit: () => true,
  },
} as const satisfies Record<string, Zone>