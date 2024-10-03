import { Ice } from '@game/types/game';

export const ICE = {
  NeuralKatana: {
    id: 'NeuralKatana',
    effects: [{
      type: 'damage.mental',
      amount: 3,
    }]
  }
} as const satisfies Record<string, Ice>;