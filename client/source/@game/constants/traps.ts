import { Trap } from '@game/types/game';

export const Traps = {
  RabbitHole: {
    id: 'RabbitHole',
    effects: [{
      type: 'ram.reduce',
      amount: 1,
    }]
  }
} as const satisfies Record<string, Trap>;