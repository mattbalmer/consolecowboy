import { Game, Program } from '@shared/types/game';
import { appendMessages } from '@shared/utils/game/cli';
import { CLIArgs } from '@shared/types/game/cli';

export const ProgramKeywords = {
  siphon: 'siphon',
} as const;

export const Programs = {
  siphon1: () => ({
    keyword: ProgramKeywords.siphon,
    id: 'siphon1',
    onExecute(game: Game, args: CLIArgs): Game {
      // Create SiphonDaemon at player's location, which will interact with Wallet at the location each turn for $50 per turn.
      return appendMessages(game, [{
        type: 'output',
        value: `Siphon Daemon created at ${game.player.node} with strength ${args._[0]}`,
      }]);
    },
  }),
} as const satisfies Record<string, (...args: unknown[]) => Program>;