import { Trap } from '@game/types/game';
import { Game } from '@game/types';
import { GameEffects } from '@game/constants/effects';

export const Traps = {
  RabbitHole: ({ amount, duration }: { amount: number, duration: number }) => ({
    id: 'RabbitHole',
    amount: amount || 1,
    duration: duration || 2,
    activate(game: Game): Game {
      const { amount, duration } = this;
      game.stack = [
        ...game.stack,
        GameEffects.AddCondition({
          condition: {
            id: 'ram.reduce',
            until: game.round + duration,
            onStart(game) {
              return {
                ...game,
                stack: [
                  ...game.stack,
                  GameEffects.RamReduce({ amount }),
                ],
              };
            },
            onEnd(game) {
              return {
                ...game,
                stack: [
                  ...game.stack,
                  GameEffects.RamIncrease({ amount }),
                ]
              };
            },
          }
        }),
      ];
      return game;
    },
  }),
} as const satisfies Record<string, (...args: unknown[]) => Trap>;