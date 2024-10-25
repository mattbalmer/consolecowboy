import { BehaviorPattern, Daemon, NodeID } from '@shared/types/game';
import { Triggers } from '@shared/constants/triggers';
import { Behaviors } from '@shared/constants/behaviors';
import { appendMessage } from '@shared/utils/game/cli';

export class DaemonIDTracker {
  byType = new Map<keyof typeof Daemons, number>();

  next(type: keyof typeof Daemons) {
    this.byType.set(type, (this.byType.get(type) ?? 0) + 1);
    return `${type}${this.byType.get(type)}`;
  }
}

export const Daemons = {
  Hunter: (props: {
    id: string,
    node: NodeID,
    status?: Daemon['status'],
  }) => ({
    id: props.id,
    model: `Hunter`,
    name: props.id,
    conditions: [],
    status: props.status ?? 'STANDBY',
    node: props.node,
    onStatus(game, newStatus, oldStatus) {
      if (newStatus === 'ACTIVE') {
        return appendMessage(game, {
          type: 'output',
          value: `Hunter activated at ${this.node}`,
        });
      }

      if (newStatus === 'TERMINATED') {
        return appendMessage(game, {
          type: 'output',
          value: `Hunter terminated at ${this.node}`,
        });
      }

      if (newStatus === 'STANDBY' && oldStatus === 'ACTIVE') {
        return appendMessage(game, {
          type: 'output',
          value: `Hunter at ${this.node} moved into sleep mode.`,
        });
      }
    },
    get behaviors(): BehaviorPattern {
      return [
        [
          [Triggers.IsStatus('ACTIVE'), Triggers.RoundEnd()],
          [
            // Behaviors.MoveToNoise(this, { min: 1 }),
            Behaviors.MoveToPlayer(this),
            Behaviors.Message(this, (daemon) => ({
              type: `output`,
              value: `Hunter moved to ${daemon.node}`,
            })),
          ]
        ],
        [
          [Triggers.IsStatus('ACTIVE'), Triggers.NoiseAtNode({
            node: 'any',
            max: 2,
          })],
          Behaviors.SetStatus(this, { status: 'STANDBY' }),
        ],
        [
          [Triggers.IsStatus('STANDBY'), Triggers.NoiseAtNode({
            node: 'any',
            min: 3,
          })],
          Behaviors.SetStatus(this, { status: 'ACTIVE' }),
        ],
        [
          [Triggers.IsStatus('ACTIVE'), Triggers.OnPlayer()],
          [
            Behaviors.AttackMental(this, { amount: 2 }),
            Behaviors.SetStatus(this, {
              status: 'TERMINATED',
            })
          ]
        ],
      ];
    },
  }),
} as const satisfies Record<string, (...args: unknown[]) => Daemon>;