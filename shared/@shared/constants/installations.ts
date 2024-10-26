import { Installation, NodeID, NodeSpecifier } from '@shared/types/game';
import { GameEffects } from '@shared/constants/effects';
import { appendMessage } from '@shared/utils/game/cli';
import { Scripts } from '@shared/constants/scripts';
import { GameError } from '@shared/errors/GameError';
import { nodeSpecifierToID } from '@shared/utils/game';

export const Installations = {
  Wallet: ({ amount }: { amount: number }) => ({
    id: 'wallet',
    executionCount: 0,
    amount,
    props: {
      drainPerExecute: 50,
    },
    onInfo(game, args) {
      return appendMessage(game, {
        type: 'output',
        value: game.player.stats.recon.info >= 1 ? `Wallet contains $${this.amount}` : `Wallet contains an unknown amount`,
      });
    },
    canExecute(game) {
      return this.amount > 0;
    },
    onExecute(game) {
      const amountToDrain = Math.min(this.amount, this.props.drainPerExecute);
      this.amount -= amountToDrain;
      game = appendMessage(game, {
        type: 'output',
        value: `Stole $${amountToDrain} from wallet`,
      });
      return {
        ...game,
        stack: [...game.stack, GameEffects.AddMoney({ amount: amountToDrain })],
      }
    },
  }),
  RemoteEXE: (target: NodeID) => ({
    id: 'exe.remote',
    executionCount: 0,
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
    executionCount: 0,
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
    executionCount: 0,
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
    executionCount: 0,
    isConnected,
    canExecute() {
      return this.executionCount < 1 && this.isConnected;
    },
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