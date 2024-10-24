import { Trigger } from '@shared/types/game';

export const Triggers = {
  RoundEnd: () => ({
    id: `RoundEnd`,
    shouldRun(daemon, { command }): boolean {
      return daemon.status === 'ACTIVE' && command === 'next';
    },
  }),
} as const satisfies Record<string, (...args: unknown[]) => Trigger>;