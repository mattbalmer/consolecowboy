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
import { appendMessage, appendMessages } from '@shared/utils/game/cli';
import { executeContent } from '@shared/utils/game/servers';
import { GameError } from '@shared/errors/GameError';
import { executeBehaviors } from '@shared/utils/game/daemons';

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
    onExecute(this: Behavior, daemon, { game, derived, ...args }: BehaviorArgs): Game {
      console.debug(`Daemon ${daemon.id} attempting to move using target selector ${this.props.selector.id}`);
      const targetNode = this.props.selector.getNode({ game, derived, ...args });
      if (targetNode) {
        console.debug(`Daemon ${daemon.id} attempting to move to ${targetNode}`);
        const path = pathToNode(game, derived, daemon.node, targetNode);
        if (!path) {
          console.debug('no valid path found - doing nothing');
          return game;
        } else if (path.length > 1) {
          this.state.hasArrived = false;
          daemon.node = derived.nodeMap[coordToString(path[1])];
          if (daemon.node === targetNode) {
            console.debug('Arrived at target node', path);
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
          return game;
        } else {
          console.debug('Already at target node', path);
          if (this.props.onArrive && !this.state.hasArrived) {
            this.state.hasArrived = true;
            game = executeBehaviors(daemon, this.props.onArrive, { game, derived, ...args });
          }
          return game;
        }
      } else {
        this.state.hasArrived = false;
        console.debug('No target node found - doing nothing');
        return game;
      }
    },
  }),
  AttackMental: (props: {
    amount: number,
  }) => ({
    id: `AttackMental`,
    props,
    onExecute(daemon, { game }: BehaviorArgs): Game {
      game.stack = [
        ...game.stack,
        GameEffects.MentalDamage({ amount: this.props.amount }),
      ];
      return game;
    },
  }),
  SetStatus: (props: {
    status: Daemon['status'],
  }) => ({
    id: `SetStatus`,
    props,
    onExecute(daemon, { game }: BehaviorArgs): Game {
      const { status } = this.props;
      const oldStatus = daemon.status;
      daemon.status = status;
      if (daemon.onStatus) {
        game.daemons[daemon.id] = daemon;
        game = daemon.onStatus(game, status, oldStatus);
      }
      if (status === 'TERMINATED') {
        delete game.daemons[daemon.id];
      }
      return game;
    },
  }),
  SetState: (stateSetter: (daemon: Daemon) => Record<string, unknown>) => ({
    id: `SetState`,
    props: {
      stateSetter,
    },
    onExecute(daemon, { game }: BehaviorArgs): Game {
      daemon.state = this.props.stateSetter(daemon);
      game.daemons[daemon.id] = daemon;
      return game;
    },
  }),
  ExecuteAtSelf: (props: { benefactor: EntityURN }) => ({
    id: `ExecuteAtSelf`,
    props,
    onExecute(daemon, { game }: BehaviorArgs): Game {
      try {
        console.log('pragma> execute at self', daemon, game);
        game = appendMessage(game, {
          type: 'output',
          value: `Executing daemon ${daemon.id} at self`,
        });
        game = executeContent(game, daemon.node, `daemon:${daemon.id}`, this.props.benefactor);
      } catch (error) {
        if (error instanceof GameError) {
          game = appendMessages(game, error.messages);
        } else {
          throw error;
        }
      }
      return game;
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
  //     return game;
  //   },
  // }),
  Message: (getMessage: CLIMessage | ((daemon: Daemon) => CLIMessage)) => ({
    id: `Message`,
    props: {
      getMessage: typeof getMessage === 'function' ? getMessage : () => getMessage,
    },
    onExecute(daemon, { game }: BehaviorArgs): Game {
      game = appendMessage(game, this.props.getMessage(daemon));
      return game;
    },
  }),
} as const satisfies Record<string, (...args: unknown[]) => Behavior>;
