import { Behavior, Daemon, NodeID, Trigger } from '@shared/types/game';
import { Triggers } from '@shared/constants/triggers';
import { Behaviors } from '@shared/constants/behaviors';

export class DaemonIDTracker {
  byType = new Map<keyof typeof Daemons, number>();

  next(type: keyof typeof Daemons) {
    this.byType.set(type, (this.byType.get(type) ?? 0) + 1);
    return `${type}${this.byType.get(type)}`;
  }
}

export const Daemons = {
  Hunter: ({
    id,
    node,
    status,
  }: {
    id: string,
    node: NodeID,
    status?: Daemon['status'],
  }) => ({
    id,
    model: `Hunter`,
    name: id,
    conditions: [],
    status: status ?? 'STANDBY',
    node,
    get behaviors() {
      return [
        [Triggers.RoundEnd(), [
          Behaviors.MoveToPlayer(this),
          // Behaviors.MoveToNoise(this, { min: 1 }),
        ]],
        [Triggers.OnPlayer(), [
          Behaviors.AttackMental(this, { amount: 2 }),
          Behaviors.SelfDestruct(this)
        ]],
      ] as [Trigger, Behavior[]][]
    },
  }),
} as const satisfies Record<string, (...args: unknown[]) => Daemon>;