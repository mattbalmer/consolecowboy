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
        content: 'siphon1',
      },
      1: null,
      3: null,
      4: {
        type: 'firmware',
        content: 'core1',
      },
    },
    scripts: {},
    programCapacity: 4,
    scriptCapacity: 4,
  } as SavedDeck<'OnoSendai'>),
} as const satisfies Record<string, (...args: unknown[]) => SavedDeck>;