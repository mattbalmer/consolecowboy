import { Game, Script } from '@shared/types/game';
import { GameEffects } from '@shared/constants/effects';

export const Scripts = {
  Reallocate: (props: {
    ram: number,
  }) => ({
    id: 'Reallocate',
    props,
    name: `Reallocate${props.ram}`,
    onExecute(game: Game): Game {
      return {
        ...game,
        stack: [
          ...game.stack,
          GameEffects.RamIncrease({ amount: this.props.ram }),
          GameEffects.MentalDamage({ amount: this.props.ram }),
        ]
      };
    },
  }),
} as const satisfies Record<string, (...args: unknown[]) => Script>;