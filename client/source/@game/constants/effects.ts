import { Condition, Game } from "@game/types";
import { sleep } from '@shared/utils/functions';

export type GameEffect<ID extends string = string> = {
  id: ID,
  trigger(game: Game): Game,
}

export const GameEffects = {
  MentalDamage: ({ amount }: { amount?: number }) => ({
    id: 'damage.mental',
    amount: amount || 1,
    trigger(game) {
      console.log('trigger for amount', this.amount);
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
            current: game.player.ram.current - this.amount
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
            current: game.player.ram.current + this.amount
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
  })
} as const satisfies {
  [id in string]: (...args: unknown[]) => GameEffect<id>
};