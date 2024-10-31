import { LevelController } from '@matrix/level-controllers/base';
import { Command, Game } from '@matrix/types';
import { GameEffects } from '@shared/constants/effects';
import { CLIArgs } from '@shared/types/game/cli';
import { appendMessage } from '@shared/utils/game/cli';

export default class extends LevelController {
  levelID: string = '3';

  hasShownDice = false;
  hasShownDrill = false;

  onChange({ game }: { game: Game }) {
    if (game.player.node === 'A' && !this.hasShownDice) {
      const nextDie = game.player.dice.find(d => d.isAvailable);
      this.hasShownDice = true;
      game.stack = [
        ...game.stack,
        GameEffects.SimpleDialog({
          title: 'Dice Powered',
          body: `Each action requires one or more Dice to perform. Until now, I've been secretly using them for you. From now on, you'll need to add "-d <dice>" to your commands to use them. (eg. "move b -d ${nextDie?.value || 3}")`,
        }),
      ];
    }

    if (game.player.node === 'B' && !this.hasShownDrill) {
      this.hasShownDrill = true;
      const nextDie = game.player.dice.find(d => d.isAvailable);
      game.stack = [
        ...game.stack,
        GameEffects.SimpleDialog({
          title: 'ICE',
          body: `Net Corps often install ICE over important servers they don't want you to access. You cannot execute any servers with active ICE, but you can interact with the ICE and (most of the time) move around the network. Later you can learn how to break them, but if you're ever unable to break ice, you can try to drill through. This will remove it, but also activate any layers that are unbroken. Use "drill -d ${nextDie?.value || '<dice>'}"`,
        }),
      ];
    }

    return { game };
  };


  onCommand(game: Game, command: Command, args: CLIArgs) {
    if (command === 'break') {
      return {
        shouldContinue: false,
        game: appendMessage(game, {
          type: 'output',
          value: `the 'break' command is not enabled yet, keep playing to unlock it`
        })
      }
    }
  }
}