import { LevelController } from '@matrix/level-controllers/base';
import { CoreCommand, Game } from '@matrix/types';
import { CLIArgs } from '@shared/types/game/cli';
import { appendMessage } from '@shared/utils/game/cli';
import { delayDialog } from '@matrix/level-controllers/utils';
import { DialogContentText } from '@mui/material';

export default class extends LevelController {
  levelID: string = '2';

  hasShownActionCost = false;
  hasShownOOA = false;

  onChange({ game, setGame }) {
    if (game.player.node === 'B' && !this.hasShownActionCost) {
      this.hasShownActionCost = true;
      delayDialog(setGame, {
        title: 'Actions',
        body: `Each round, you get 3 actions. Most commands cost 1 action (some, like "info", are free). You can see your remaining actions by the number of dice in the top right. (Don't worry about the values on the dice for now.)`
      }, 0);
    }

    if (game.player.actions < 1 && !this.hasShownOOA) {
      this.hasShownOOA = true;
      delayDialog(setGame, {
        title: 'Out of Actions',
        body: <DialogContentText>
          When you use your last action - you can type "next" to end your turn and get 3 new actions. <br />
          <i>(If you want, you can use "config autonext true" to automatically end your turn when you run out of actions)</i>
        </DialogContentText>,
      }, 0);
    }

    return { game };
  };

  onCommand(game: Game, command: CoreCommand, args: CLIArgs) {
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