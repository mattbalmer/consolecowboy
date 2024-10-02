import * as React from 'react';
import { FlexCol } from '@client/components/FlexCol';
import { FlexRow } from '@client/components/FlexRow';
import { useEffect, useMemo, useState } from 'react';
import { Game, NodeID } from '@game/types';
import { coordToString } from '@game/utils/grid';
import { Grid } from '@game/components/Grid';

const useGame = () => {
  const [game, setGame] = useState<Game>({
    nodes: {
      'A': { x: 0, y: 0 },
      'B': { x: 0, y: 1 },
      'C': { x: 1, y: 0 },
      'D': { x: 1, y: 1 },
      'E': { x: 2, y: 0 },
    },
    edges: {
      'A:B': 'bi',
      'A:C': 'bi',
      'B:D': 'bi',
      'C:D': 'bi',
      'C:E': 'bi',
    },
    hovered: 'A',
  });

  return {
    game,
    setGame,
  }
}


export const GameScreen = () => {
  const { game, setGame } = useGame();

  const hoveredNode = useMemo(() => coordToString(game.nodes[game.hovered]), [game.nodes, game.hovered]);
  const nodeMap = useMemo(() => {
    const keys = Object.keys(game.nodes);
    return Object.values(game.nodes).map(coordToString).reduce((m, coord, i) => {
      return {
        ...m,
        [coord]: keys[i],
      }
    }, {} as Record<string, NodeID>);
  }, [game.nodes, game.hovered]);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      setGame((prev) => {
        const hovered = prev.hovered;
        const node = prev.nodes[hovered];
        const y = node.y - 1;
        const coordStr = coordToString({ x: node.x, y });
        if (coordStr in nodeMap) {
          return {
            ...prev,
            hovered: nodeMap[coordStr],
          }
        }
        return prev;
      });
    }
    if (e.key === 'ArrowDown') {
      setGame((prev) => {
        const hovered = prev.hovered;
        const node = prev.nodes[hovered];
        const y = node.y + 1;
        const coordStr = coordToString({ x: node.x, y });
        if (coordStr in nodeMap) {
          return {
            ...prev,
            hovered: nodeMap[coordStr],
          }
        }
        return prev;
      });
    }
    if (e.key === 'ArrowLeft') {
      setGame((prev) => {
        const hovered = prev.hovered;
        const node = prev.nodes[hovered];
        const x = node.x - 1;
        const coordStr = coordToString({ x, y: node.y });
        if (coordStr in nodeMap) {
          return {
            ...prev,
            hovered: nodeMap[coordStr],
          }
        }
        return prev;
      });
    }
    if (e.key === 'ArrowRight') {
      setGame((prev) => {
        const hovered = prev.hovered;
        const node = prev.nodes[hovered];
        const x = node.x + 1;
        const coordStr = coordToString({ x, y: node.y });
        if (coordStr in nodeMap) {
          return {
            ...prev,
            hovered: nodeMap[coordStr],
          }
        }
        return prev;
      });
    }
  }

  // Assign key down
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    }
  }, []);

  return <div>
    <FlexCol
      sx={{ flexGrow: 1, height: '100vh', background: '#111', alignItems: 'center', justifyContent: 'center' }}
    >
      <FlexRow sx={{ alignItems: 'center' }}>
        <Grid
          size={[-2, 2]}
          hoveredNode={hoveredNode}
          nodeMap={nodeMap}
        />
      </FlexRow>
    </FlexCol>
  </div>
}