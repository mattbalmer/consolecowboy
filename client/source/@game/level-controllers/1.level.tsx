import { LevelController } from '@game/level-controllers/base';
import { Command, Game } from '@game/types';
import { GameEffects } from '@shared/constants/effects';
import { CLIArgs } from '@shared/types/game/cli';
import { appendMessage } from '@shared/utils/game/cli';

export default class extends LevelController {
  levelID = '1';

  hasShownIntro = false;
  hasShownExit = false;

  onChange({ game }: { game: Game }) {
    if (game.history.terminal.length === 0 && game.stack.length === 0 && !this.hasShownIntro) {
      this.hasShownIntro = true;
      game.stack = [
        ...game.stack,
        GameEffects.SimpleDialog({
          title: 'Welcome to Netrunner!',
          body: `Your goal in each hostile net is to grab as much as you can, then exit through an external connection. You always enter through one of these, but they generally close behind you - find another! To play the game, use the terminal at the bottom to enter commands. First try moving nodes, using "move <target>" (eg. "move B")`,
        }),
      ];
    }

    if (game.player.node === 'B' && !this.hasShownExit) {
      this.hasShownExit = true;
      game.stack = [
        ...game.stack,
        GameEffects.SimpleDialog({
          title: 'Time to leave',
          body: `You've reached the exit node! Use the "execute" (alias "x") command to run the ExternalConnection server and exit the net.`,
        }),
      ];
    }

    return { game };
  };

  onCommand(game: Game, command: Command, args: CLIArgs) {
    if (game.player.node === 'A' && command !== 'move') {
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