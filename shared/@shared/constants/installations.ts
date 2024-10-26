import { Installation, NodeID, NodeSpecifier } from '@shared/types/game';
import { GameEffects } from '@shared/constants/effects';
import { appendMessage } from '@shared/utils/game/cli';
import { Scripts } from '@shared/constants/scripts';
import { GameError } from '@shared/errors/GameError';
import { nodeSpecifierToID } from '@shared/utils/game';

export const Installations = {
  Wallet: ({ amount }: { amount: number }) => ({
    id: 'Wallet',
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
    onExecute(game, actor, node, benefactor) {
      const amountToDrain = Math.min(this.amount, this.props.drainPerExecute);
      this.amount -= amountToDrain;
      console.log('pragma> drain from wallet', amountToDrain, game, actor, benefactor, node);
      game = appendMessage(game, {
        type: 'output',
        value: actor.startsWith('daemon:')
          ? `${actor.split(':')[1]} stole $${amountToDrain} from wallet`
          : `Stole $${amountToDrain} from wallet`
      });
      return {
        ...game,
        stack: [...game.stack, GameEffects.AddMoney({ amount: amountToDrain, to: benefactor || actor })],
      }
    },
  }),
  RemoteEXE: (target: NodeID) => ({
    id: 'exe.remote',
    executionCount: 0,
    target,
    onExecute(game, actor, node) {
      return {
        ...game,
        stack: [...game.stack, GameEffects.Execute({
          target: this.target,
          actor: `server:${node}`
        })],
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