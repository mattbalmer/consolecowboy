import { LevelController } from '@game/level-controllers/base';
import { Command, Game } from '@game/types';
import { GameEffects } from '@shared/constants/effects';
import { CLIArgs } from '@shared/types/game/cli';
import { appendMessage } from '@shared/utils/game/cli';

export default class extends LevelController {
  levelID = '4';

  hasShownBreak = false;
  hasShownMultilayer = false;

  onChange({ game }: { game: Game }) {
    if (game.hovered === 'B' && !this.hasShownBreak) {
      this.hasShownBreak = true;
      const nextDie = game.player.dice.find(d => d.isAvailable);
      game.stack = [
        ...game.stack,
        GameEffects.SimpleDialog({
          title: 'ICEBreaker',
          body: `To break ICE, you can use "break -l <layer#> -d <dice>" (eg. "break -l 0 -d ${nextDie?.value || '<dice>'})`,
        }),
      ];
    }

    if (game.hovered === 'B' && !this.hasShownMultilayer && game.nodes['B'].ice.status === 'BROKEN') {
      this.hasShownMultilayer = true;
      game.stack = [
        ...game.stack,
        GameEffects.SimpleDialog({
          title: 'Layers',
          body: `ICE can have multiple layers. You (usually) break them one-at-a-time. Once all layers are broken - the ICE will deactivate, and you can run whatever is installed in that server.`,
        }),
      ];
    }

    return { game };
  };


  onCommand(game: Game, command: Command, args: CLIArgs) {
    if (command === 'drill') {
      return {
        shouldContinue: false,
        game: appendMessage(game, {
          type: 'output',
          value: `Cheeky, eh? Use the 'break' command for now.`
        })
      }
    }
  }
}