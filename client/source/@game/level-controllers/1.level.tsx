import { LevelController } from '@game/level-controllers/base';
import { Command, Game } from '@game/types';
import { GameEffects } from '@shared/constants/effects';
import { CLIArgs } from '@shared/types/game/cli';
import { appendMessage } from '@shared/utils/game/cli';

export default class extends LevelController {
  levelID: string = '1';

  hasShownIntro = false;
  hasShownExit = false;

  onChange({ game }: { game: Game }) {
    console.log('onChange', game.history.terminal.length);
    if (game.history.terminal.length === 0 && game.stack.length === 0 && !this.hasShownIntro) {
      this.hasShownIntro = true;
      game.stack = [
        ...game.stack,
        GameEffects.SimpleDialog({
          title: 'Welcome to Netrunner!',
          body: `To play the game, use the terminal at the bottom to enter commands. First try moving nodes, using "move <target>" (eg. "move B")`,
        }),
      ];
    }

    if (game.hovered === 'B' && !this.hasShownExit) {
      this.hasShownExit = true;
      game.stack = [
        ...game.stack,
        GameEffects.SimpleDialog({
          title: 'Time to leave',
          body: `You've reached the exit node! Use the "open" command to open the ExternalConnection server and exit the net.`,
        }),
      ];
    }

    return { game };
  };

  onCommand(game: Game, command: Command, args: CLIArgs) {
    if (game.hovered === 'A' && command !== 'move') {
      return {
        shouldContinue: false,
        game: appendMessage(game, {
          type: 'output',
          value: `You need to move first! Try "move b"`
        })
      }
    }

    if (command === 'config') {
      return {
        shouldContinue: false,
        game: appendMessage(game, {
          type: 'output',
          value: `the 'config' command is not enabled yet, keep playing to unlock it`
        })
      }
    }

    const nextDie = game.player.dice.find(d => d.isAvailable);
    return {
      shouldContinue: true,
      args: {
        ...args,
        d: nextDie ? [nextDie.value] : [],
      } as CLIArgs,
    };
  }
}