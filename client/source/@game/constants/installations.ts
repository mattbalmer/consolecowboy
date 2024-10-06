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
  ExternalConnection: () => ({
    id: 'connection.external',
    // @ts-ignore TODO fix with rest of this
    onCapture(game) {
      // finish the run
      return {
        ...game,
        mode: 'VIEW',
        stack: [...game.stack, GameEffects.Print('You have successfully connected to the external server')],
      }
    },
  }),
} as const satisfies Record<string, (...args: unknown[]) => Installation>;