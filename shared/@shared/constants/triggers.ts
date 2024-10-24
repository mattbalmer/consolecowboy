import { Trigger } from '@shared/types/game';

export const Triggers = {
  RoundEnd: () => ({
    id: `RoundEnd`,
    shouldRun(daemon, { command }): boolean {
      return daemon.status === 'ACTIVE' && command === 'next';
    },
  }),
  OnPlayer: () => ({
    id: `OnPlayer`,
    shouldRun(daemon, { game }): boolean {
      return daemon.status === 'ACTIVE' && daemon.node === game.hovered;
    },
  }),
} as const satisfies Record<string, (...args: unknown[]) => Trigger>;