import { Installation } from '@game/types/game';
import { GameEffects } from '@game/constants/effects';

export const Installations = {
  Wallet: ({ amount }: { amount: number }) => ({
    id: 'wallet',
    amount,
    onCapture(game) {
      return {
        ...game,
        stack: [...game.stack, GameEffects.AddMoney({ amount: this.amount })],
      }
    },
  }),
} as const satisfies Record<string, (...args: unknown[]) => Installation>;