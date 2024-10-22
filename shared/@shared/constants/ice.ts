import { GameEffects } from '@shared/constants/effects';
import { Game, Ice } from '@shared/types/game';
import { appendMessage } from '@shared/utils/game/cli';

export const ICE = {
  NeuralKatana: () => ({
    id: 'NeuralKatana',
    activationCount: 0,
    status: 'READY',
    strength: 1,
    layers: [
      {
        status: 'ACTIVE',
        effects: [
          GameEffects.MentalDamage({ amount: 1 }),
          GameEffects.Delay({ amount: 500 }),
          GameEffects.MentalDamage({ amount: 1 }),
          GameEffects.Delay({ amount: 500 }),
          GameEffects.MentalDamage({ amount: 1 }),
        ],
      },
    ],
    activate(game: Game): Game {
      if (this.activationCount < 1) {
        this.activationCount += 1;
        this.status = 'ACTIVE';
        return game;
      } else {
        return game;
      }
    },
    complete(game: Game): Game {
      this.status = 'COMPLETE';
      return {
        ...game,
        stack: [
          ...this.layers.filter(l => l.status === 'ACTIVE').map(l => l.effects).flat(),
          ...game.stack
        ]
      };
    },
    break(game: Game, layer: number): Game {
      if (game.player.stats.icebreaker >= this.strength) {
        this.layers[layer].status = 'BROKEN';
        if (this.layers.filter(l => l.status === 'ACTIVE').length === 0) {
          this.status = 'BROKEN';
        }
        return game;
      } else {
        return appendMessage(game, {
          type: 'error',
          value: `Not enough icebreaker strength to break this ice`,
        });
      }
    }
  })
} as const satisfies Record<string, (...args: unknown[]) => Ice>;