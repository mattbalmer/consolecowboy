import { Behavior, Daemon, NodeID, Trigger } from '@shared/types/game';
import { Triggers } from '@shared/constants/triggers';
import { Behaviors } from '@shared/constants/behaviors';

export const Daemons = {
  Hunter: ({
    node,
    status,
  }: {
    node: NodeID,
    status?: Daemon['status'],
  }) => ({
    id: `Hunter`,
    name: `Hunter`,
    conditions: [],
    status: status ?? 'STANDBY',
    node,
    get behaviors() {
      return [
        [Triggers.RoundEnd(), [
          Behaviors.MoveToPlayer(this),
          // Behaviors.MoveToNoise(this, { min: 1 }),
        ]] as [Trigger, Behavior[]],
        // [Triggers.OnPlayer(this), [
        //   Behaviors.Attack(this),
        //   Behaviors.SelfDestruct(this)
        // ]],
      ]
    },
  }),
} as const satisfies Record<string, (...args: unknown[]) => Daemon>;