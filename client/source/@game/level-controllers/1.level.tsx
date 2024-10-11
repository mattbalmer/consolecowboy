import { LevelController } from '@game/level-controllers/base';
import { Game } from '@game/types';
import { GameEffects } from '@shared/constants/effects';

export class Level1Controller extends LevelController {
  levelID: string = '1';

  onChange({ game }: { game: Game }) {
    console.log('onChange', game.history.terminal.length);
    if (game.history.terminal.length === 0 && game.stack.length === 0) {
      game.stack = [
        ...game.stack,
        GameEffects.SimpleDialog({
          title: 'Welcome to Netrunner!',
          body: `To play the game, use the terminal at the bottom to enter command such as 'move' or 'info'`,
        }),
      ];
    }

    return { game };
  };
}