import { Firmware } from '@shared/types/game';

export const Firmwares = {
  core1: () => ({
    id: 'core1',
    model: 'core',
    name: 'Core Commands',
    description: 'Contains basic commands for interacting with the matrix.',
    tags: [],
    features: [],
    stats: {},
  } as Firmware<'core'>),
} as const satisfies Record<string, (...args: unknown[]) => Firmware>;