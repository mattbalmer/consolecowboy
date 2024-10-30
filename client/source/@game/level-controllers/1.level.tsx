import { LevelController } from '@game/level-controllers/base';
import { CoreCommand, Game } from '@game/types';
import { GameEffects } from '@shared/constants/effects';
import { CLIArgs } from '@shared/types/game/cli';
import { appendMessage } from '@shared/utils/game/cli';

export default class extends LevelController {
  levelID = '1';

  hasShownIntro = false;
  hasDoneInfo = false;
  hasShownMove = false;
  hasShownDrain = false;
  hasDrained = false;
  hasShownDrainComplete = false;
  hasShownExit = false;

  onChange({ game, setGame }) {
    if (!this.hasShownIntro) {
      this.hasShownIntro = true;
      const commandLine = (document.querySelector('#command-line') as HTMLElement);
      const showInputDialog = () => {
        commandLine.removeEventListener('focus', showInputDialog);
        setGame(prev => {
          return {
            ...prev,
            stack: [
              ...prev.stack,
              GameEffects.SimpleDialog({
                title: 'Commands',
                body: `Well done! Let's try our first command. Type "info" to get information on the Server (node) you're on.`,
              })
            ]
          }
        });
      }

      game.stack = [
        ...game.stack,
        GameEffects.SimpleDialog({
          title: 'Hostile Nets',
          body: `Welcome to your first Hostile Net. Grab as much as you can, then exit through an external connection. First things first - find the terminal at the bottom of the page. You can focus it (and navigate your input history) using the Up/Down Arrow Keys.`,
          onClose: () => {
            // todo: jank af
            setTimeout(() => {
              commandLine.blur();
              (document.querySelector('#consolecowboy-app') as HTMLElement).focus();
              commandLine.addEventListener('focus', showInputDialog);
            }, 50);
          }
        }),
      ];
    }

    // You always enter through one of these, but they generally close behind you - find another! To play the game, use the terminal at the bottom to enter commands. First try moving nodes, using "move <target>" (eg. "move B")

    if (game.player.node === 'A' && this.hasDoneInfo && !this.hasShownMove) {
      this.hasShownMove = true;
      setTimeout(() => {
        setGame(prev => {
          return {
            ...prev,
            stack: [
              ...prev.stack,
              GameEffects.SimpleDialog({
                title: 'Moving',
                body: `Damn! External Connections close behind you, so you'll have to find your way to another one. Let's move on. Use the "move" command to move to any adjacent Server. Try "move B".`,
              }),
            ]
          }
        })
      }, 500);
    }

    if (game.player.node === 'B' && !this.hasShownDrain) {
      this.hasShownDrain = true;
      setTimeout(() => {
        setGame(prev => {
          return {
            ...prev,
            stack: [
              ...prev.stack,
              GameEffects.SimpleDialog({
                title: 'Something Interesting',
                body: `Well hang on - this Server has something installed in it. Use "info" to see what, and type "execute" (or "x" for short) to execute the code on the server.`,
              }),
            ]
          }
        })
      }, 500);
    }

    if (game.player.node === 'C' && !this.hasShownExit) {
      this.hasShownExit = true;
      game.stack = [
        ...game.stack,
        GameEffects.SimpleDialog({
          title: 'Time to leave',
          body: `You've reached the exit node! Use the "execute" (alias "x") command to run the ExternalConnection server and exit the net.`,
        }),
      ];
    }

    game.player.actions = 3;
    game.player.dice = [{
      value: 3,
      isAvailable: true,
    },{
      value: 3,
      isAvailable: true,
    },{
      value: 3,
      isAvailable: true,
    }]
    return { game };
  };

  onCommand(game: Game, command: CoreCommand, args: CLIArgs) {
    if (game.player.node === 'A' && !this.hasDoneInfo && command === 'info') {
      this.hasDoneInfo = true;
      return;
    }

    if (game.player.node === 'A' && !this.hasDoneInfo && command !== 'info') {
      return {
        shouldContinue: false,
        game: appendMessage(game, {
          type: 'output',
          value: `You need to gather info first! Type "info"`
        })
      }
    }

    if (game.player.node === 'A' && this.hasDoneInfo && command !== 'move') {
      return {
        shouldContinue: false,
        game: appendMessage(game, {
          type: 'output',
          value: `You need to move first! Try "move b"`
        })
      }
    }

    // @ts-ignore
    if (game.player.node === 'B' && !this.hasDrained && !(command === 'execute' || command === 'x' || command === 'info')) {
      return {
        shouldContinue: false,
        game: appendMessage(game, {
          type: 'output',
          value: `Steal the money before moving on! Try "execute"`
        })
      }
    }

    // @ts-ignore
    if (game.player.node === 'B' && !this.hasDrained && (command === 'execute' || command === 'x')) {
      this.hasDrained = true;
      return;
    }

    // @ts-ignore
    if (game.player.node === 'B' && this.hasDrained && !(command === 'execute' || command === 'x' || command === 'info' || (command === 'move' && args._[0] === 'c'))) {
      return {
        shouldContinue: false,
        game: appendMessage(game, {
          type: 'output',
          value: `Let's move on to C now. Try "move c"`
        })
      }
    }

    // @ts-ignore
    if (game.player.node === 'C' && !(command === 'execute' || command === 'x' || command === 'info')) {
      return {
        shouldContinue: false,
        game: appendMessage(game, {
          type: 'output',
          value: `Time to leave! Try "execute"`
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