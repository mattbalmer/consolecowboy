import { Installation, NodeID } from '@shared/types/game';
import { GameEffects } from '@shared/constants/effects';
import { appendMessage } from '@shared/utils/game/cli';

export const Installations = {
  Wallet: ({ amount }: { amount: number }) => ({
    id: 'wallet',
    amount,
    onExecute(game) {
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
  RemoteEXE: (target: NodeID) => ({
    id: 'exe.remote',
    target,
    onExecute(game) {
      return {
        ...game,
        stack: [...game.stack, GameEffects.Execute({ target: this.target })],
      }
    },
  }),
  RemoteEnableConnection: (target: NodeID) => ({
    id: 'exe.remote-enable-connection',
    target,
    onExecute(game) {
      game = appendMessage(game, {
        type: 'output',
        value: `External connection at ${this.target} opened`,
      });
      return {
        ...game,
        stack: [...game.stack, GameEffects.ModifyServerContent({
          target: this.target,
          props: { isConnected: true },
        })],
      }
    },
  }),
  ExternalConnection: (isConnected: boolean = true) => ({
    id: 'connection.external',
    isConnected,
    onExecute(game) {
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