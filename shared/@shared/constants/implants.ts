import { Implant } from '@shared/types/game';

export const Implants = {
  'JackOnoSendai1': () => ({
    id: 'JackOnoSendai1',
    model: 'Jack',
    name: 'Ono Sendai Jack',
    value: 1000,
    description: 'Allows the user to interface with Ono Sendai Decks.',
    features: [],
    tags: [],
    stats: {
      recon: {
        info: 1,
      }
    }
  }),
} as const satisfies Record<string, (...args: unknown[]) => Implant>;