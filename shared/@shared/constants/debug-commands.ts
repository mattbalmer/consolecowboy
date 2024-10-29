import { DEBUG_COMMANDS, DebugCommand, Game, GameDerived, } from '@shared/types/game';
import { appendMessage, appendMessages } from '@shared/utils/game/cli';
import { CLIArgs } from '@shared/types/game/cli';

const DebugCommands = {
  noise: (game: Game, args: CLIArgs) => {
    if (args.help) {
      return appendMessages(game, [{
        type: 'output',
        value: `Usage: noise <level>`
      }, {
        type: 'output',
        value: `Sets noise level of the current node`
      }]);
    }

    const level = parseInt(args._[0]);

    if (isNaN(level)) {
      return appendMessage(game, {
        type: 'error',
        value: `Noise level must be a number`
      });
    }

    game.noise[game.player.node] = [{
      source: 'program',
      actor: 'player',
      amount: level,
      round: game.round,
    }];

    return {
      ...game,
    }
  },
} as const satisfies Record<DebugCommand, (game: Game, args: CLIArgs<any, any>, derived?: GameDerived) => Game>;

export const executeDebugCommand = (command: DebugCommand, game: Game, args: CLIArgs, derived: GameDerived): Game => {
  if (command in DebugCommands) {
    // @ts-ignore
    return DebugCommands[command](game, args, derived);
  }

  return appendMessage(game, {
    type: 'error',
    value: `Debug command not found: ${command}`
  });
}
