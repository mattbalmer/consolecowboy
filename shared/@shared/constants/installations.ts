import { Installation, NodeID, NodeSpecifier } from '@shared/types/game';
import { GameEffects } from '@shared/constants/effects';
import { appendMessage } from '@shared/utils/game/cli';
import { Scripts } from '@shared/constants/scripts';
import { GameError } from '@shared/errors/GameError';
import { nodeSpecifierToID } from '@shared/utils/game';

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
  ScriptStorage: <K extends keyof typeof Scripts>(scriptID: K, props: Parameters<typeof Scripts[K]>) => ({
    id: 'server.script-storage',
    scriptID,
    scriptProps: props,
    onExecute(game) {
      return {
        ...game,
        player: {
          ...game.player,
          scripts: [
            ...game.player.scripts,
            Scripts[this.scriptID](this.scriptProps),
          ]
        }
      }
    },
  }),
  RemoteEnableConnection: (target: NodeSpecifier) => ({
    id: 'exe.remote-enable-connection',
    target,
    onExecute(game) {
      const target = nodeSpecifierToID(game.nodes, this.target);
      game = appendMessage(game, {
        type: 'output',
        value: `External connection at ${target} opened`,
      });
      return {
        ...game,
        stack: [...game.stack, GameEffects.ModifyServerContent({
          target,
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
        throw new GameError(`Connection is not open, use a different external connection.`);
      }
    },
  }),
} as const satisfies Record<string, (...args: unknown[]) => Installation>;