import { Level } from '@shared/types/game/level';
import { Game, GameDerived } from '@shared/types/game';
import { useEffect, useMemo, useState } from 'react';
import { gameFromLevel, getGameDerived } from '@shared/utils/game';
import { getControllerFor } from '@game/level-controllers';
import { useCommands } from '@game/hooks/use-commands';
import { GameEffects } from '@shared/constants/effects';

export const useGame = ({
  level,
  player,
  shouldBindController,
  levelID,
}: {
  player: Game['player'],
  level: Level,
} & ({
  levelID: string,
  shouldBindController: true,
} | {
  levelID?: string,
  shouldBindController?: false,
})) => {
  const [game, setGame] = useState<Game>(gameFromLevel(
    level,
    player,
  ));
  const [gameDerived, setGameDerived] = useState<GameDerived>(getGameDerived(game));
  const levelController = useMemo(() => {
    return shouldBindController ? getControllerFor(levelID) : null;
  }, [shouldBindController, levelID]);

  console.log('level', { ...level });
  console.log('game', { ...game });
  console.log('derived', { ...gameDerived });

  const onCommand = useCommands({
    game,
    setGame,
    gameDerived,
    levelController,
  });

  useEffect(() => {
    setGame((prev) => {
      const newGame = gameFromLevel(level, player);
      return {
        ...newGame,
        player: {
          ...newGame.player,
          node: newGame.nodes[game.player.node] ? game.player.node : level.start,
        },
      };
    });
  }, [level, player]);

  useEffect(() => {
    if (game.mode !== 'FROZEN' && game.player.mental < 1 && !game.stack.some((effect) => effect.id === 'finish.mental-drained')) {
      setGame({
        ...game,
        stack: [
          ...game.stack,
          GameEffects.EjectMentalDrained(),
        ]
      })
    }

    setGameDerived(getGameDerived(game));
  }, [game]);

  useEffect(() => {
    if (levelController) {
      setGame((prev) => {
        return levelController.onChange({
          game: prev,
        }).game;
      });
    }
  }, [game.stack, game.history.terminal]);

  return {
    game,
    setGame,
    gameDerived,
    onCommand,
  }
}