import { Level } from '@shared/types/game/level';
import { Game, GameNode, NodeID, NodeMap, NoiseEvent } from '@shared/types/game';
import { useEffect, useMemo, useState } from 'react';
import { gameFromLevel, invertNodes } from '@shared/utils/game';
import { coordToString } from '@shared/utils/game/grid';
import { getControllerFor } from '@game/level-controllers';
import { useCommands } from '@game/hooks/use-commands';
import { GameEffects } from '@shared/constants/effects';

export type GameDerived = {
  hoveredNode: GameNode,
  nodeMap: NodeMap,
  noise: {
    [nodeID: string]: number,
    total: number,
  },
}

const noiseAtNode = (round: number, events: NoiseEvent[]): number => {
  return events.reduce((sum, event) => {
    const decay = event.decay || 1;
    const duration = event.duration || 1;
    const lastRound = event.round + (duration - 1);
    const roundsSince = round - lastRound;
    const noiseFromEvent = Math.max(0, event.amount - (roundsSince * decay));

    return sum + noiseFromEvent;
  }, 0);
}

const getGameDerived = (game: Game): GameDerived => {
  const hoveredNodeXY = coordToString(game.nodes[game.hovered]);
  const nodeMap = invertNodes(game.nodes);
  const hoveredNode = game.nodes[nodeMap[hoveredNodeXY]];

  let totalNoise = 0;
  const noiseMap = Object.entries(game.noise).reduce<Record<NodeID, number>>(
    (map, [node, noiseEvents]) => {
      map[node] = noiseAtNode(game.round, noiseEvents);
      totalNoise += map[node];
      return map;
    },
    {}
  );

  return {
    hoveredNode,
    nodeMap,
    noise: {
      ...noiseMap,
      total: totalNoise,
    }
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
        hovered: newGame.nodes[prev.hovered] ? prev.hovered : newGame.hovered,
      };
    });
  }, [level, player]);

  useEffect(() => {
    if (game.player.mental < 1) {
      return setGame({
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