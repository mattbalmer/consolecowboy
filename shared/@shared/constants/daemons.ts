import { EntityURN, BehaviorPattern, Daemon, DaemonID, NodeID, BehaviorArgs } from '@shared/types/game';
import { Triggers } from '@shared/constants/triggers';
import { Behaviors } from '@shared/constants/behaviors';
import { appendMessage } from '@shared/utils/game/cli';
import { BehaviorPatterns } from '@shared/constants/behavior-patterns';
import { executeContent } from '@shared/utils/game/servers';
import { COMMANDS_WITH_ACTION_COST } from '@shared/constants/commands';
import { Installations } from '@shared/constants/installations';
import { terminateDaemon } from '@shared/utils/game/daemons';

export const Daemons = {
  SuicideHunter: (props: {
    id: DaemonID,
    node: NodeID,
    status?: Daemon['status'],
  }) => ({
    id: props.id,
    model: `SuicideHunter`,
    name: props.id,
    conditions: [],
    status: props.status ?? 'STANDBY',
    node: props.node,
    stats: {
      inventorySize: 0,
    },
    inventory: [],
    props: {
      noiseActivate: 3,
      noiseDeactivate: 2,
      damage: 2,
    },
    onStatus(game, newStatus, oldStatus) {
      if (newStatus === 'ACTIVE') {
        return appendMessage(game, {
          type: 'output',
          value: `${this.model} activated at ${this.node}`,
        });
      }

      if (newStatus === 'TERMINATED') {
        return appendMessage(game, {
          type: 'output',
          value: `${this.model} terminated at ${this.node}`,
        });
      }

      if (newStatus === 'STANDBY' && oldStatus === 'ACTIVE') {
        return appendMessage(game, {
          type: 'output',
          value: `${this.model} at ${this.node} went into sleep mode.`,
        });
      }
    },
    get behaviors() {
      return [
        BehaviorPatterns.MoveToNoise({ min: this.props.noiseActivate }),
        [
          [Triggers.IsStatus('ACTIVE'), Triggers.NoiseAtNode({
            node: 'any',
            max: this.props.noiseDeactivate,
          })],
          Behaviors.SetStatus({ status: 'STANDBY' }),
        ],
        [
          [Triggers.IsStatus('STANDBY'), Triggers.NoiseAtNode({
            node: 'any',
            min: this.props.noiseActivate,
          })],
          Behaviors.SetStatus({ status: 'ACTIVE' }),
        ],
        BehaviorPatterns.ExplodeAtPlayer({ damage: this.props.damage })
      ] as BehaviorPattern;
    },
  }),
  SimpleSiphoner: (props: {
    id: DaemonID,
    node: NodeID,
    status?: Daemon['status'],
    into: EntityURN,
    power?: number,
    noise?: number,
  }) => ({
    id: props.id,
    model: `SimpleSiphoner`,
    name: props.id,
    conditions: [],
    status: props.status ?? 'ACTIVE',
    node: props.node,
    stats: {
      inventorySize: 0,
    },
    inventory: [],
    state: {
      turnsActive: 0,
    },
    props: {
      power: props.power ?? 50,
      noise: props.noise ?? 1,
    },
    onStatus(game, newStatus, oldStatus) {
      if (newStatus === 'ACTIVE') {
        return appendMessage(game, {
          type: 'output',
          value: `${this.model} activated at ${this.node}`,
        });
      }

      // if (newStatus === 'TERMINATED') {
      //   return appendMessage(game, {
      //     type: 'output',
      //     value: `${this.model} terminated at ${this.node}`,
      //   });
      // }

      if (newStatus === 'STANDBY' && oldStatus === 'ACTIVE') {
        return appendMessage(game, {
          type: 'output',
          value: `${this.model} at ${this.node} went into sleep mode.`,
        });
      }

      return game;
    },
    onGameUpdate(this: Daemon<{
      power: number,
      noise: number,
    }, {
      turnsActive: number,
    }>, { game, command }: BehaviorArgs) {
      console.log('onGameUpdate', game, command, this);
      if (COMMANDS_WITH_ACTION_COST.includes(command) && this.status === 'ACTIVE') {
        const installation = (game.nodes[this.node].content) as unknown as ReturnType<typeof Installations['Wallet']> | undefined;
        console.log('onGameUpdate:installation', installation);

        if (!installation || installation.id !== 'Wallet') {
          game = appendMessage(game, {
            type: 'output',
            value: `${this.model} cannot siphon - shutting down`,
          });
          return terminateDaemon(game, this.id);
        }

        if (installation.amount < 1) {
          game = appendMessage(game, {
            type: 'output',
            value: `${this.model} has completed siphoning - shutting down`,
          });
          return terminateDaemon(game, this.id);
        }

        game = executeContent(game, this.node, `daemon:${this.id}`, 'player');
        this.state.turnsActive += 1;

        if (this.state.turnsActive >= 3) {
          game = appendMessage(game, {
            type: 'output',
            value: `${this.model} has run out of turns - shutting down`,
          });
          return terminateDaemon(game, this.id);
        }
      }

      return game;
    },
    // get behaviors() {
    //   return [
    //     // todo: something about this being at the end of the list breaks the references
    //     [
    //       [
    //         Triggers.IsStatus('ACTIVE'),
    //         Triggers.PlayerAction()
    //       ],
    //       [
    //         Behaviors.SetState((daemon) => ({
    //           ...daemon.state || {},
    //           turnsActive: (daemon.state?.turnsActive as number || 0) + 1,
    //         }))
    //       ],
    //     ],
    //     [
    //       [
    //         Triggers.IsStatus('ACTIVE'),
    //         Triggers.PlayerAction(),
    //         Triggers.Custom((daemon, { game }) =>
    //           game.nodes[daemon.node]?.content?.id === 'Wallet' && canExecute(game, daemon.node, `daemon:${daemon.id}`)
    //         )
    //       ],
    //       [
    //         // todo: figure out how this is reducing value of the installation, but not adding it to the player
    //         Behaviors.ExecuteAtSelf({ benefactor: 'player' }),
    //       ],
    //     ],
    //     [
    //       [
    //         Triggers.IsStatus('ACTIVE'),
    //         Triggers.PlayerAction(),
    //         Triggers.Custom((daemon: any) =>
    //           daemon.state.turnsActive >= 3
    //         )
    //       ],
    //       [
    //         Behaviors.Message({ type: `output`, value: `SimpleSiphoner has run out of turns` }),
    //         Behaviors.SetStatus({ status: 'TERMINATED' }),
    //       ],
    //     ],
    //     [
    //       [
    //         Triggers.IsStatus('ACTIVE'),
    //         Triggers.PlayerAction(),
    //         // Can no longer execute (because empty)
    //         Triggers.Custom((daemon, { game }) => {
    //           console.debug('wtfffff', daemon.node, game.nodes[daemon.node]?.content);
    //           if (game.nodes[daemon.node]?.content?.id !== 'Wallet') {
    //             return true;
    //           }
    //           const amountLeft = (game.nodes[daemon.node]?.content?.['amount'] as unknown as number) || 0;
    //           return amountLeft < 1;
    //         }),
    //       ],
    //       [
    //         Behaviors.Message({ type: `output`, value: `SimpleSiphoner has completed siphoning` }),
    //         Behaviors.SetStatus({ status: 'TERMINATED' }),
    //       ],
    //     ],
    //   ] as BehaviorPattern;
    // },
  }),
} as const satisfies Record<string, (...args: unknown[]) => Daemon>;