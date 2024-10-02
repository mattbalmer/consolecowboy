import * as React from 'react';
import { FlexCol } from '@client/components/FlexCol';
import { FlexRow } from '@client/components/FlexRow';
import { useEffect, useMemo, useState } from 'react';
import { Box } from '@mui/material';

type NodeID = `${string}`;
type EdgeString = `${string}:${string}`;
type Dir = 'up' | 'down' | 'right' | 'left';

type Node = {
  x: number,
  y: number,
}

type Game = {
  nodes: Record<NodeID, Node>,
  edges: Record<EdgeString, 'oneway' | 'bi'>,
  hovered: NodeID,
}

const coordToString = ({ x, y }) => `${x},${y}`;

const getEdgeDirs = (nodeMap: Record<string, string>, { x, y }: { x: number, y: number }): Dir[] => {
  let output: Dir[] = [];

  if (coordToString({ x: x - 0.5, y }) in nodeMap && coordToString({ x: x + 0.5, y }) in nodeMap) {
    output.push('left');
    output.push('right');
  }
  if (coordToString({ x, y: y - 0.5 }) in nodeMap && coordToString({ x, y: y + 0.5 }) in nodeMap) {
    output.push('up');
    output.push('down');
  }
  // if (coordToString({ x: x - 0.5, y }) in nodeMap) {
  //   output.push('left');
  // }
  // if (coordToString({ x: x + 0.5, y }) in nodeMap) {
  //   output.push('right');
  // }
  // if (coordToString({ x, y: y - 0.5 }) in nodeMap) {
  //   output.push('up');
  // }
  // if (coordToString({ x, y: y + 0.5 }) in nodeMap) {
  //   output.push('down');
  // }

  return output
}

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

const Node = ({ id, selected, exist }: {
  id: string,
  selected: boolean,
  exist?: boolean,
}) => {
  return <Box
    data-key={id}
    sx={{
      width: 50,
      height: 50,
      background: selected ? 'red' : exist === true ? 'blue' : '#222',
      border: '1px solid white',
      borderRadius: '50%',
    }}
  />
}

const Edge = ({ id, dirs }: {
  id: string,
  dirs: Dir[],
}) => {
  return <Box
    data-key={id}
    sx={{
      position: 'relative',
      width: 50,
      height: 50,
    }}
  >
    {dirs.filter(dir => dir === 'left' || dir === 'up').map(dir => {
      return <Box
        key={dir}
        data-key={dir}
        sx={{
          width: dir === 'left' ? 30 : 10,
          height: dir === 'up' ? 30 : 10,
          background: 'green',
          border: '1px solid white',
          borderRadius: 10,
          position: 'absolute',
          top: dir === 'up' ? 10 : '50%',
          left: dir === 'left' ? 10 : '50%',
          transform: dir === 'up' ? 'translateX(-50%)' : 'translateY(-50%)',
        }}
      />
    })}
  </Box>
}

export const Game = () => {
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

  const size = [-2, -1, 0, 1, 2].reduce((s, n) => [...s, n, n + 0.5], []).slice(0, -1);

  return <div>
    <FlexCol
      sx={{ flexGrow: 1, height: '100vh', background: '#111', alignItems: 'center', justifyContent: 'center' }}
    >
      <FlexRow sx={{ alignItems: 'center' }}>
        {size.slice(0).map(x => {
          return <FlexCol
            key={`${x}`}
            sx={{ alignItems: 'center' }}
          >
            {size.slice(0).map(y => {
              const coordStr = coordToString({ x, y });
              if (x % 1 === 0 && y % 1 === 0) {
                return <Node
                  id={coordStr}
                  key={coordStr}
                  selected={coordStr === hoveredNode}
                  exist={coordStr in nodeMap}
                />
              } else {
                const dirs = getEdgeDirs(nodeMap, { x, y });
                console.log('dirs', x, y, dirs);
                return <Edge
                  id={coordStr}
                  key={coordStr}
                  dirs={dirs}
                />
              }
            })}
          </FlexCol>
        })}
      </FlexRow>
    </FlexCol>
  </div>
}