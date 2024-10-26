import { Game, Trap } from '@shared/types/game';
import { GameEffects } from '@shared/constants/effects';

export const Traps = {
  RabbitHole: (props: { amount: number, duration: number }) => ({
    id: 'RabbitHole',
    executionCount: 0,
    props: {
      amount: props.amount ?? 1,
      duration: props.duration ?? 2,
    },
    onExecute(game: Game): Game {
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