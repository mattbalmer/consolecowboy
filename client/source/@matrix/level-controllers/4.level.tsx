import { LevelController } from '@matrix/level-controllers/base';
import { Command, Game } from '@matrix/types';
import { GameEffects } from '@shared/constants/effects';
import { CLIArgs } from '@shared/types/game/cli';
import { appendMessage } from '@shared/utils/game/cli';

export default class extends LevelController {
  levelID = '4';

  hasShownBreak = false;
  hasShownNoise = false;
  hasShownMultilayer = false;

  onChange({ game }: { game: Game }) {
    if (game.player.node === 'B' && !this.hasShownBreak) {
      this.hasShownBreak = true;
      const nextDie = game.player.dice.find(d => d.isAvailable);
      game.stack = [
        ...game.stack,
        GameEffects.SimpleDialog({
          title: 'ICEBreaker',
          body: `To break ICE, you can use "break -l <layer#> -d <dice>" (eg. "break -l 0 -d ${nextDie?.value || '<dice>'}).`,
        }),
      ];
    }

    if (game.player.node === 'B' && !this.hasShownMultilayer && game.nodes['B'].ice.status === 'BROKEN') {
      this.hasShownMultilayer = true;
      game.stack = [
        ...game.stack,
        GameEffects.SimpleDialog({
          title: 'Layers',
          body: `ICE can have multiple layers. You (usually) break them one-at-a-time. Once all layers are broken - the ICE will deactivate, and you can run whatever is installed in that server.`,
        }),
      ];
    }

    if (game.player.node === 'C' && !this.hasShownNoise) {
      this.hasShownNoise = true;
      game.stack = [
        ...game.stack,
        GameEffects.SimpleDialog({
          title: 'Noise',
          body: `Almost every action generates noise (including moving!). ICEBreaking is particularly noise - each layer generates 1 noise when broken, and breaking the entire ICE generates noise equal to the dice value used minus the ICE's strength (eg. "break -d 4" on ICE of Strength 2 generates 2 noise.). Noise will dissipate over time, but it can alert the Net Corps to your presence.`,
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

    if (game.player.node === 'B' && game.nodes['B'].ice.status !== 'BROKEN' && !['config', 'next', 'break'].includes(command)) {
      return {
        shouldContinue: false,
        game: appendMessage(game, {
          type: 'output',
          value: `Break the ICE before moving on`
        })
      }
    }
  }
}