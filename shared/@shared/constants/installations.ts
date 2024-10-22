import { Installation } from '@shared/types/game';
import { GameEffects } from '@shared/constants/effects';
import { appendMessage } from '@shared/utils/game/cli';

export const Installations = {
  Wallet: ({ amount }: { amount: number }) => ({
    id: 'wallet',
    amount,
    onCapture(game) {
      game = appendMessage(game, {
        type: 'output',
        value: `Stole $${this.amount} from wallet`,
      });
      return {
        ...game,
        stack: [...game.stack, GameEffects.AddMoney({ amount: this.amount })],
      }
    },
  }),
  ExternalConnection: (isConnected: boolean = true) => ({
    id: 'connection.external',
    isConnected,
    onCapture(game) {
      if (this.isConnected) {
        game = appendMessage(game, {
          type: 'output',
          value: `Extraction complete`,
        });
        // finish the run
        return {
          ...game,
          mode: 'VIEW',
          stack: [...game.stack, GameEffects.ExtractFromNetwork()],
        }
      } else {
        return appendMessage(game, {
          type: 'error',
          value: `Connection is not open, use a different external connection.`,
        });
      }
    },
  }),
} as const satisfies Record<string, (...args: unknown[]) => Installation>;