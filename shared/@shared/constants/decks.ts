import { SavedDeck } from '@shared/types/game';

export const Decks = {
  'OnoSendai': () => ({
    id: 'OnoSendai1',
    model: 'OnoSendai',
    name: 'Ono Sendai',
    value: 1000,
    description: 'A deck of Ono Sendai programs and firmware.',
    programs: {
      0: {
        type: 'program',
        content: 'core1',
      },
      1: {
        type: 'program',
        content: 'siphon1',
      },
      3: {
        type: 'program',
        content: null,
      },
      4: {
        type: 'firmware',
        content: null,
      },
    },
    scripts: [],
    scriptCapacity: 4,
  } as SavedDeck<'OnoSendai'>),
} as const satisfies Record<string, (...args: unknown[]) => SavedDeck>;