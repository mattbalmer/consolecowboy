import { LevelController } from '@game/level-controllers/base';
import { Command, Game } from '@game/types';
import { GameEffects } from '@shared/constants/effects';
import { CLIArgs } from '@shared/types/game/cli';
import { appendMessage } from '@shared/utils/game/cli';

export default class extends LevelController {
  levelID: string = '2';

  hasShownOpen = false;
  hasShownOOA = false;

  onChange({ game }: { game: Game }) {
    if (game.hovered === 'B' && !this.hasShownOpen) {
      this.hasShownOpen = true;
      game.stack = [
        ...game.stack,
        GameEffects.SimpleDialog({
          title: 'Bit o Coin',
          body: `A great way to get some quick cash is to hack into your target's wallets. Use "execute" on a server run whatever asset is installed in it. Sometimes you might find money!`,
        }),
      ];
    }

    if (game.player.actions < 1 && !this.hasShownOOA) {
      this.hasShownOOA = true;
      game.stack = [
        ...game.stack,
        GameEffects.SimpleDialog({
          title: 'Out of Actions',
          body: `Each round, you get 3 actions to perform. If you run out, run "next" to end your turn and get 3 new actions (don't worry about the dice values for now). (If you want, you can use "config autonext true" to automatically end your turn when you run out of actions). Be aware - each time you run "next", you take 1 Mental damage and the enemy net gets a turn to run any active defenses.`,
        }),
      ];
    }

    return { game };
  };

  onCommand(game: Game, command: Command, args: CLIArgs) {
    if (command === 'config' && !this.hasShownOOA) {
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