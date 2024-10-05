import { GameEffects } from '@game/constants/effects';
import { Ice } from '@game/types/game';
import { Game } from '@game/types';

export const ICE = {
  NeuralKatana: () => ({
    id: 'NeuralKatana',
    activationCount: 0,
    status: 'READY',
    effects: [
      [GameEffects.MentalDamage({ amount: 3 })],
    ],
    activate(game: Game): Game {
      if (this.activationCount < 1) {
        this.activationCount += 1;
        this.status = 'ACTIVE';
        return {
          ...game,
          stack: [
            ...this.effects.flat(),
            ...game.stack
          ]
        };
      } else {
        return game;
      }
    }
  })
} as const satisfies Record<string, (...args: unknown[]) => Ice>;