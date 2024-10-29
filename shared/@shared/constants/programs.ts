import { Daemon, Game, Program } from '@shared/types/game';
import { appendMessages } from '@shared/utils/game/cli';
import { CLIArgs } from '@shared/types/game/cli';
import { Daemons } from '@shared/constants/daemons';

export const ProgramKeywords = {
  siphon: 'siphon',
} as const;

export const Programs = {
  siphon1: () => ({
    keyword: ProgramKeywords.siphon,
    id: 'siphon1',
    model: 'siphon',
    name: 'Siphon Program',
    description: 'Siphon $50 from a wallet each turn.',
    tags: [],
    features: [],
    stats: {},
    onExecute(game: Game, args: CLIArgs): Game {
      const power = 50;
      // Create SiphonDaemon at player's location, which will interact with Wallet at the location each turn for $50 per turn.

      const nodeContainsDaemon = Object.values(game.daemons)
        .some(d =>
          d.model === 'SimpleSiphoner' && d.node === game.player.node
        );

      if (nodeContainsDaemon) {
        return appendMessages(game, [{
          type: 'error',
          value: `A siphon daemon already exists at ${game.player.node}`,
        }]);
      }

      const daemon: Daemon = Daemons.SimpleSiphoner({
        id: game.daemonIDTracker.next('SimpleSiphoner'),
        node: game.player.node,
        status: 'ACTIVE',
        power,
        noise: 1,
        into: 'player',
      });

      daemon.onInit?.();

      game.daemons = {
        ...game.daemons,
        [daemon.id]: daemon,
      };

      return appendMessages(game, [{
        type: 'output',
        value: `Siphon Daemon created at ${game.player.node} with power ${power}`,
      }]);
    },
  }),
} as const satisfies Record<string, (...args: unknown[]) => Program>;