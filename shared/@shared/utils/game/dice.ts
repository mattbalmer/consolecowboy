import { Game, GameDie } from '@shared/types/game';
import { CLIArgs } from '@shared/types/game/cli';
import { GameError } from '@shared/errors/GameError';
import { replace } from '@shared/utils/arrays';

export const getDiceCounts = (dice: GameDie[], max: number = 6) => {
  const starter = Array.from({ length: max })
    .reduce<Record<number, number>>((a, _, i) => ({
      ...a,
      [i + 1]: 0,
    }), {});
  return dice.reduce((a, d) => {
    if (d.isAvailable) {
      return {
        ...a,
        [d.value]: (a[d.value] || 0) + 1,
      };
    } else {
      return a;
    }
  }, starter);
}

export const getAutoDice = (game: Game): number => {
  const dice = game.player.config.autodice;
  if (!dice) {
    return undefined;
  }
  const availableValues = game.player.dice
    .filter(d => d.isAvailable)
    .map(d => d.value);
  if (dice === 'lowest') {
    return Math.min(...availableValues);
  } else if (dice === 'highest') {
    return Math.max(...availableValues);
  }
}

export const consumeDice = (game: Game, args: CLIArgs<Record<string, any>, any>): Game => {
  const givenDice = args.d?.[0];
  const dice = givenDice ?? getAutoDice(game);

  if (!dice) {
    throw new GameError('No valid dice given');
  }

  if (getDiceCounts(game.player.dice)[dice] < 1) {
    throw new GameError(`No available dice of value ${dice}`);
  }

  const diceIndex = game.player.dice.findIndex(d => d.value === dice && d.isAvailable);

  if (diceIndex < 0) {
    console.log('error allocating dice used', dice, diceIndex, game.player.dice);
    throw new GameError(`Error allocating dice usage (-d ${args.d})`);
  }

  return {
    ...game,
    player: {
      ...game.player,
      actions: game.player.actions - 1,
      dice: replace(game.player.dice, diceIndex, [{
        value: dice,
        isAvailable: false,
      }]),
    },
  };
}