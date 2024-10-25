import { Daemon, NodeID, Trigger } from '@shared/types/game';
import { noiseAtNode } from '@shared/utils/game';

export const Triggers = {
  IsStatus: (status: Daemon['status'] | Daemon['status'][]) => ({
    id: `IsStatus`,
    props: {
      statuses: Array.isArray(status) ? status : [status],
    },
    shouldRun(daemon, { command }): boolean {
      return this.props.statuses.includes(daemon.status);
    },
  }),
  RoundEnd: () => ({
    id: `RoundEnd`,
    shouldRun(daemon, { command }): boolean {
      return command === 'next';
    },
  }),
  OnPlayer: () => ({
    id: `OnPlayer`,
    shouldRun(daemon, { game }): boolean {
      return daemon.node === game.player.node;
    },
  }),
  NoiseAtNode: (props: {
    node: 'any' | 'total' | NodeID,
    min?: number,
    max?: number,
  }) => ({
    id: `NoiseAtNode`,
    props,
    shouldRun(daemon, { game, derived }): boolean {
      const min = this.props.min ?? 0;
      const max = this.props.max ?? Infinity;
      const node = this.props.node;

      if (node === 'total') {
        return derived.noise.total >= min && derived.noise.total <= max;
      }

      if (node === 'any') {
        const highest = derived.noise.highest?.[1] || 0;
        console.log('is noise any', highest, min, max);
        return highest >= min && highest <= max;
      }

      if (game.noise[node]) {
        const noise = noiseAtNode(game.round, game.noise[node]);
        return noise >= min && noise <= max;
      }

      return false;
    },
  }),
} as const satisfies Record<string, (...args: unknown[]) => Trigger>;