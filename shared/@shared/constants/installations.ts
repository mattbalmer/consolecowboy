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
  ExternalConnection: () => ({
    id: 'connection.external',
    onCapture(game) {
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
    },
  }),
} as const satisfies Record<string, (...args: unknown[]) => Installation>;