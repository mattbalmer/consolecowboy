import {
  EntityURN,
  Behavior,
  BehaviorArgs,
  CLIMessage,
  Daemon,
  Game, NodeID,
} from '@shared/types/game';
import { coordToString, pathToNode } from '@shared/utils/game/grid';
import { GameEffects } from '@shared/constants/effects';
import { appendMessage } from '@shared/utils/game/cli';
import { executeContent } from '@shared/utils/game/servers';
import { GameError } from '@shared/errors/GameError';
import { ItemID } from '@shared/types/game/items';

export const executeBehaviors = (daemon: Daemon, behaviors: Behavior[], args: BehaviorArgs): Game => {
  let game = args.game;
  behaviors.forEach(behavior => {
    game = behavior.onExecute(daemon, { ...args, game }).game;
  });
  return game;
}

type TargetSelector = {
  id: string,
  props?: any,
  getNode(args: BehaviorArgs): NodeID,
};
export const TargetSelectors = {
  Static: (props: { node: NodeID }) => ({
    id: 'Static',
    props,
    getNode() {
      return this.props.node;
    },
  }),
  Player: () => ({
    id: 'Player',
    getNode: ({ game }: BehaviorArgs) => game.player.node
  }),
  HighestNoise: (props: { min: number }) => ({
    id: 'HighestNoise',
    props,
    getNode({ derived }: BehaviorArgs) {
      if (!derived.noise.highest) {
        return null;
      }
      const [node, level] = derived.noise.highest;
      if (level < this.props.min) {
        console.log(`Noise of ${level} at ${node} is below min of ${this.props.min}`);
        return null;
      }
      return node;
    },
  }),
} as const satisfies Record<string, (props: any) => TargetSelector>;

export const Behaviors = {
  MoveTo: (selector: TargetSelector, props?: {
    announce?: boolean,
    announceArrival?: boolean,
    onArrive?: Behavior[],
  }) => ({
    id: `MoveToNoise`,
    props: {
      selector,
      announce: props?.announce ?? true,
      announceArrival: props?.announceArrival ?? false,
      onArrive: props?.onArrive ?? [],
    },
    state: {
      hasArrived: false,
    },
    onExecute(this: Behavior, daemon, { game, derived, ...args }: BehaviorArgs): { daemon: Daemon, game: Game } {
      console.log(`Daemon ${daemon.id} attempting to move using target selector ${this.props.selector.id}`);
      const targetNode = this.props.selector.getNode({ game, derived, ...args });
      if (targetNode) {
        console.log(`Daemon ${daemon.id} attempting to move to ${targetNode}`);
        const path = pathToNode(game, derived, daemon.node, targetNode);
        if (!path) {
          console.log('no valid path found - doing nothing');
          return { game, daemon };
        } else if (path.length > 1) {
          this.state.hasArrived = false;
          daemon.node = derived.nodeMap[coordToString(path[1])];
          if (daemon.node === targetNode) {
            console.log('Arrived at target node', path);
            if (this.props.onArrive && !this.state.hasArrived) {
              this.state.hasArrived = true;
              game = executeBehaviors(daemon, this.props.onArrive, { game, derived, ...args });
            }
          }
          if (this.props.announce) {
            game = appendMessage(game, {
              type: 'output',
              value: `${daemon.model} ${this.state.hasArrived && this.props.announceArrival ? `arrived at` : `moved to`} ${daemon.node}`,
            });
          }
          return { game, daemon };
        } else {
          console.log('Already at target node', path);
          if (this.props.onArrive && !this.state.hasArrived) {
            this.state.hasArrived = true;
            game = executeBehaviors(daemon, this.props.onArrive, { game, derived, ...args });
          }
          return { game, daemon };
        }
      } else {
        this.state.hasArrived = false;
        console.log('No target node found - doing nothing');
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
  SetState: (stateSetter: (daemon: Daemon) => Record<string, unknown>) => ({
    id: `SetState`,
    props: {
      stateSetter,
    },
    onExecute(daemon, { game }: BehaviorArgs): { daemon: Daemon, game: Game } {
      daemon.state = stateSetter(daemon);
      return { game, daemon };
    },
  }),
  ExecuteAtSelf: (props: { benefactor: EntityURN }) => ({
    id: `ExecuteAtSelf`,
    props,
    onExecute(daemon, { game }: BehaviorArgs): { daemon: Daemon, game: Game } {
      try {
        console.log('execute at self', game);
        game = appendMessage(game, {
          type: 'output',
          value: `Executing daemon ${daemon.id} at self`,
        });
        game = executeContent(game, daemon.node, `daemon:${daemon.id}`, this.props.benefactor);
      } catch (error) {
        if (error instanceof GameError) {
          game = appendMessage(game, {
            type: 'error',
            value: error.message,
          });
        } else {
          throw error;
        }
      }
      return { game, daemon };
    },
  }),
  // TransferItemTo: (props: { item: ItemID, amount: number, target: EntityURN }) => ({
  //   id: `TransferItemTo`,
  //   props,
  //   onExecute(daemon, { game }: BehaviorArgs): { daemon: Daemon, game: Game } {
  //     const { target, item, amount } = this.props;
  //     if () {
  //
  //     }
  //     if (target === 'player') {
  //       game.player.inventory = [
  //         ...game.player.inventory,
  //         {
  //           item: this.props.item,
  //           count: this.props.amount
  //         },
  //       ];
  //     }
  //     try {
  //       game = executeContent(game, daemon.node, `daemon:${daemon.id}`);
  //     } catch (error) {
  //       if (error instanceof GameError) {
  //         game = appendMessage(game, {
  //           type: 'error',
  //           value: error.message,
  //         });
  //       } else {
  //         throw error;
  //       }
  //     }
  //     return { game, daemon };
  //   },
  // }),
  Message: (getMessage: CLIMessage | ((daemon: Daemon) => CLIMessage)) => ({
    id: `Message`,
    props: {
      getMessage: typeof getMessage === 'function' ? getMessage : () => getMessage,
    },
    onExecute(daemon, { game }: BehaviorArgs): { daemon: Daemon, game: Game } {
      game = appendMessage(game, this.props.getMessage(daemon));
      return { game, daemon };
    },
  }),
} as const satisfies Record<string, (...args: unknown[]) => Behavior>;
