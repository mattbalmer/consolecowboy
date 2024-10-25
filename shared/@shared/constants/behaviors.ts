import {
  Behavior,
  BehaviorArgs,
  CLIMessage,
  Daemon,
  Game,
} from '@shared/types/game';
import { coordToString, pathToNode } from '@shared/utils/game/grid';
import { GameEffects } from '@shared/constants/effects';
import { appendMessage } from '@shared/utils/game/cli';

export const Behaviors = {
  MoveToNoise: (props?: {
    min: number,
    announce?: boolean,
  }) => ({
    id: `MoveToNoise`,
    props: {
      min: props?.min ?? 2,
      announce: props?.announce ?? true,
    },
    onExecute(this: Behavior, daemon, { game, derived }: BehaviorArgs): { daemon: Daemon, game: Game } {
      if (derived.noise.highest) {
        const highestNoiseNode = derived.noise.highest[0];
        const path = pathToNode(game, derived, daemon.node, highestNoiseNode);
        if (!path) {
          console.log('no valid path found - doing nothing');
          return { game, daemon };
        } else if (path.length > 1) {
          daemon.node = derived.nodeMap[coordToString(path[1])];
          if (this.props.announce) {
            game = appendMessage(game, {
              type: 'output',
              value: `${daemon.model} moved to ${daemon.node}`,
            });
          }
          return { game, daemon };
        } else {
          console.log('Arrived at highest noise node', path);
          return { game, daemon };
        }
      } else {
        console.log('No noise found - doing nothing');
        return { game, daemon };
      }
    },
  }),
  MoveToPlayer: () => ({
    id: `MoveToPlayer`,
    props: {},
    onExecute(this: Behavior, daemon, { game, derived }: BehaviorArgs): { daemon: Daemon, game: Game } {
      console.log('ex', this);
      if (daemon.node === game.player.node) {
        console.log('already at player - doing nothing');
        return { game, daemon };
      }
      console.log('moving to player', daemon.node, game.player.node);
      const path = pathToNode(game, derived, daemon.node, game.player.node);
      if (!path) {
        console.log('no valid path found - doing nothing');
        return { game, daemon };
      } else {
        console.log('moving to next node in path', path);
        daemon.node = derived.nodeMap[coordToString(path[1])];
        return { game, daemon };
      }
    },
  }),
  AttackMental: (props: {
    amount: number,
  }) => ({
    id: `AttackMental`,
    props,
    onExecute(daemon, { game }: BehaviorArgs): { daemon: Daemon, game: Game } {
      game.stack = [
        ...game.stack,
        GameEffects.MentalDamage({ amount: this.props.amount }),
      ];
      return { game, daemon };
    },
  }),
  SetStatus: (props: {
    status: Daemon['status'],
  }) => ({
    id: `SetStatus`,
    props,
    onExecute(daemon, { game }: BehaviorArgs): { daemon: Daemon, game: Game } {
      const { status } = this.props;
      const oldStatus = daemon.status;
      daemon.status = status;
      if (daemon.onStatus) {
        game = daemon.onStatus(game, status, oldStatus);
      }
      if (status === 'TERMINATED') {
        game.daemons = game.daemons.filter(d => d.id !== daemon.id);
      }
      return { game, daemon };
    },
  }),
  Message: (getMessage: (daemon: Daemon) => CLIMessage) => ({
    id: `Message`,
    props: {
      getMessage,
    },
    onExecute(daemon, { game }: BehaviorArgs): { daemon: Daemon, game: Game } {
      game = appendMessage(game, getMessage(daemon));
      return { game, daemon };
    },
  }),
} as const satisfies Record<string, (...args: unknown[]) => Behavior>;