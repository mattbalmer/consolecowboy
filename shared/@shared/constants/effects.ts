import { Condition, Game, GameEffect, NoiseEvent } from '@shared/types/game';
import { appendMessage } from '@shared/utils/game/cli';
import { generate } from '@shared/utils/arrays';

export const GameEffects = {
  AddNoise: ({
    node,
    ...noise
  }: {
    node: string,
  } & NoiseEvent) => ({
    id: 'noise.add',
    node,
    noise,
    trigger(game) {
      return {
        ...game,
        noise: {
          ...game.noise,
          [this.node]: [
            ...(game.noise[this.node] || []),
            this.noise,
          ],
        },
      };
    }
  }),
  Execute: ({ target }: { target: string }) => ({
    id: 'execute',
    target,
    trigger(game) {
      return game.nodes[this.target].content?.onExecute(game);
    }
  }),
  ModifyServerContent: ({ target, props }: { target: string, props: Record<string, unknown> }) => ({
    id: 'modify.server-content',
    target,
    props,
    trigger(game) {
      Object.assign(game.nodes[this.target]?.content, this.props);
      return game;
    }
  }),
  MentalDamageSilent: ({ amount }: { amount?: number }) => ({
    id: 'damage.mental-silent',
    amount: amount || 1,
    trigger(game) {
      return {
        ...game,
        player: {
          ...game.player,
          mental: game.player.mental - this.amount,
        },
      };
    }
  }),
  MentalDamage: ({ amount }: { amount?: number }) => ({
    id: 'damage.mental',
    amount: amount || 1,
    trigger(game) {
      game = appendMessage(game, {
        type: 'output',
        value: `${this.amount} mental damage taken`,
      });

      // TODO: figure out how to handle visual and timed effects while working with react's instant rerendering
      if (this.amount > 1) {
        const remaining = this.amount - 1;
        game.stack = [
          ...game.stack,
          ...generate(remaining, i => i % 2 === 0
              ? GameEffects.Delay({ amount: 500 })
              : GameEffects.MentalDamageSilent({ amount: 1 })
          )
        ];
      }

      return {
        ...game,
        player: {
          ...game.player,
          mental: game.player.mental - this.amount,
        },
      };
    }
  }),
  RamReduce: ({ amount }: { amount?: number }) => ({
    amount: amount || 1,
    id: 'ram.reduce',
    trigger(game) {
      return {
        ...game,
        player: {
          ...game.player,
          ram: {
            ...game.player.ram,
            current: Math.max(0, game.player.ram.current - this.amount),
          }
        },
      };
    }
  }),
  RamIncrease: ({ amount }: { amount?: number }) => ({
    amount: amount || 1,
    id: 'ram.increase',
    trigger(game) {
      return {
        ...game,
        player: {
          ...game.player,
          ram: {
            ...game.player.ram,
            current: Math.min(game.player.ram.current + this.amount, game.player.ram.max)
          }
        },
      };
    }
  }),
  AddCondition: ({ condition }: { condition: Condition }) => ({
    id: 'playerCondition.add',
    condition,
    trigger(game) {
      return this.condition.onStart({
        ...game,
        player: {
          ...game.player,
          conditions: [...game.player.conditions, this.condition]
        }
      });
    }
  }),
  AddMoney: ({ amount }: { amount: number }) => ({
    id: 'playerMoney.add',
    amount,
    trigger(game) {
      return {
        ...game,
        player: {
          ...game.player,
          money: game.player.money + this.amount
        },
      };
    }
  }),
  Delay: ({ amount }: { amount?: number }) => ({
    id: 'delay',
    amount: amount || 250,
    trigger(game) {
      return game;
    }
  }),
  Print: (line: Game['history']['terminal'][number]) => ({
    id: 'print',
    line,
    trigger(game: Game): Game {
      return {
        ...game,
        history: {
          ...game.history,
          terminal: [...game.history.terminal, line],
        },
      };
    },
  }),
  ExtractFromNetwork: () => ({
    id: 'finish.extraction',
    trigger(game: Game): Game {
      return {
        ...game,
        mode: 'FROZEN',
        history: {
          ...game.history,
          terminal: [...game.history.terminal, {
            type: 'output',
            value: 'You have successfully connected to the external server'
          }],
        },
      };
    },
  }),
  EjectMentalDrained: () => ({
    id: 'finish.mental-drained',
    trigger(game: Game): Game {
      return {
        ...game,
        mode: 'FROZEN',
        history: {
          ...game.history,
          terminal: [...game.history.terminal, {
            type: 'output',
            value: 'You have been ejected from the net due to mental exhaustion'
          }],
        },
      };
    },
  }),
  SimpleDialog: ({ title, body, acknowledge }: {
    title: string,
    body: string,
    acknowledge?: string,
  }) => ({
    id: 'dialog.simple',
    title,
    body,
    acknowledge,
    trigger(game) {
      return game;
    }
  }),
} as const satisfies {
  [id in string]: (...args: unknown[]) => GameEffect<id>
};