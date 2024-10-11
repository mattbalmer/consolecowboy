import { Installation } from '@shared/types/game';
import { GameEffects } from '@shared/constants/effects';

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
  ExternalConnection: () => ({
    id: 'connection.external',
    onCapture(game) {
      // finish the run
      return {
        ...game,
        mode: 'VIEW',
        stack: [...game.stack, GameEffects.ExtractFromNetwork()],
      }
    },
  }),
} as const satisfies Record<string, (...args: unknown[]) => Installation>;