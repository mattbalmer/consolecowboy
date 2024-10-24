import { LevelController } from '@game/level-controllers/base';
import { Game } from '@game/types';
import { GameEffects } from '@shared/constants/effects';

export default class extends LevelController {
  levelID = '5';

  hasShownIntro = false;

  onChange({ game }: { game: Game }) {
    if (game.player.node === 'A' && !this.hasShownIntro) {
      this.hasShownIntro = true;
      game.stack = [
        ...game.stack,
        GameEffects.SimpleDialog({
          title: 'On your own',
          body: `We've shown you the basics - time to find your own way! You can use the "help" command to see a list of available commands. Keep breaking into enemy nets to become the most notorious console cowboy in the matrix. Good luck!`,
        }),
      ];
    }

    return { game };
  };

  onCommand(){}
}