import { Behavior, Trigger } from '@shared/types/game';
import { Triggers } from '@shared/constants/triggers';
import { Behaviors, TargetSelectors } from '@shared/constants/behaviors';

export const BehaviorPatterns = {
  MoveToNoise: ({
    min,
  }: {
    min: number
  }) => ([
    [Triggers.IsStatus('ACTIVE'), Triggers.RoundEnd()],
    [
      Behaviors.MoveTo(TargetSelectors.HighestNoise({
        min: min ?? 3,
      })),
    ]
  ]),
  ExplodeAtPlayer: ({
    damage,
  }: {
    damage: number
  }) => ([
    [Triggers.IsStatus('ACTIVE'), Triggers.OnPlayer()],
    [
      Behaviors.AttackMental({ amount: damage }),
      Behaviors.SetStatus({
        status: 'TERMINATED',
      })
    ]
  ]),
} as const satisfies Record<string, (...args: unknown[]) => [
  Trigger | Trigger[],
  Behavior | Behavior[]
]>;