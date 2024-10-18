import { Level } from '@shared/types/game/level';
import { Game, GameNode, NodeMap } from '@shared/types/game';
import { useEffect, useMemo, useState } from 'react';
import { gameFromLevel, invertNodes } from '@shared/utils/game';
import { coordToString } from '@shared/utils/game/grid';
import { getControllerFor } from '@game/level-controllers';

export type GameDerived = {
  hoveredNode: GameNode,
  nodeMap: NodeMap
}

const getGameDerived = (game: Game): GameDerived => {
  const hoveredNodeXY = coordToString(game.nodes[game.hovered]);
  const nodeMap = invertNodes(game.nodes);
  const hoveredNode = game.nodes[nodeMap[hoveredNodeXY]];

  return {
    hoveredNode,
    nodeMap,
  };
}

export const useGame = ({
  level,
  player,
  shouldBindController,
  levelID,
}: {
  level: Level,
  player: Game['player'],
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

  useEffect(() => {
    setGame((prev) => {
      const newGame = gameFromLevel(level, player);
      return {
        ...newGame,
        hovered: newGame.nodes[prev.hovered] ? prev.hovered : newGame.hovered,
      };
    });
  }, [level, player]);

  useEffect(() => {
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
  }
}