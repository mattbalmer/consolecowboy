import { Game } from "@game/types";

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
  })
} as const satisfies {
  [id in string]: (...args: unknown[]) => GameEffect<id>
};