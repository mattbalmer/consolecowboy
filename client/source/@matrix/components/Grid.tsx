import { FlexCol } from '@client/components/FlexCol';
import * as React from 'react';
import { useMemo } from 'react';
import { CoordString, Dir, EdgeString, Game, GameDerived } from '@matrix/types';
import { Box, Typography } from '@mui/material';
import { coordToString } from '@matrix/utils/grid';
import { FlexRow } from '@client/components/FlexRow';
import { canExecute } from '@shared/utils/game/servers';

const Spacer = () => {
  return <Box
    data-spacer
    sx={{ width: 50, height: 50 }}
  />
}

const Node = ({ id, coord, selected, exist, isVisited, canBeExecuted, hasContent, noise, }: {
  id: string,
  coord: string,
  selected: boolean,
  exist?: boolean,
  isVisited?: boolean,
  canBeExecuted?: boolean,
  hasContent?: boolean,
  noise?: number,
}) => {
  const color = selected ? '#c44'
    : hasContent && !canBeExecuted ? '#454'
    : isVisited ? '#8c8'
    : exist ? '#44c'
    : '#222';

  if (!exist) return <Spacer />

  return <Box
    data-node={id}
    data-xy={coord}
    sx={{
      width: 50,
      height: 50,
      background: color,
      border: '1px solid white',
      borderRadius: '50%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      boxSizing: 'border-box',
      position: 'relative',
    }}
  >
    {noise > 0 && <Box sx={{
      width: 54 + (Math.min(5, noise) * 3),
      height: 54 + (Math.min(5, noise) * 3),
      boxShadow:
        `inset 0 0 ${Math.min(10, noise) * 2}px rgba(255,255,255,${Math.min(10, noise) * 0.05 + 0.5})`,
      borderRadius: `50%`,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      boxSizing: 'border-box',
      position: 'absolute',
    }}/>}
    <Typography variant={'subtitle1'}>{id}{hasContent ? !canBeExecuted ? '-' : '*' : ''}</Typography>
  </Box>
}

const Edge = ({ connecting, coord, dirs }: {
  connecting: EdgeString,
  coord: CoordString,
  dirs: Dir[],
}) => {
  return <Box
    data-edge={connecting}
    data-xy={coord}
    sx={{
      position: 'relative',
      width: 50,
      height: 50,
    }}
  >
    {dirs.filter(dir => dir === 'left' || dir === 'up').map(dir => {
      return <Box
        key={dir}
        data-edge-dir={dir}
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
          boxSizing: 'border-box',
        }}
      />
    })}
  </Box>
}

export const Grid = ({
  size,
  game,
  derived,
  offset = [0,0],
}: {
  size: [number, number],
  offset: [number, number],
  derived: GameDerived,
  game: Game,
}) => {
  const { hoveredNode, nodeMap } = derived;
  const sizeList = Array
    .from({ length: size[1] - size[0] + 1 }, (_, i) => i + size[0])
    .reduce((s, n) => [...s, n, n + 0.5], [])
    .slice(0, -1);
  const hoveredNodeXY = useMemo(() => coordToString(hoveredNode), [hoveredNode]);

  return <FlexRow
    data-grid
    sx={{ flexGrow: 1, position: 'relative', transform: `translate(${offset[0] * 100}px, ${offset[1] * 100}px)` }}
  >
    <>
      {sizeList.slice(0).map(x => {
        return <FlexCol
          key={`${x}`}
          sx={{ alignItems: 'center' }}
          data-col={x}
        >
          {sizeList.slice(0).map(y => {
            const coordStr = coordToString({ x, y });
            const nodeID = nodeMap[coordStr];
            const node = game.nodes[nodeID];
            if (x % 1 === 0 && y % 1 === 0) {
              return <Node
                id={nodeID}
                key={coordStr}
                coord={coordStr}
                selected={coordStr === hoveredNodeXY}
                exist={coordStr in nodeMap}
                canBeExecuted={canExecute(game, nodeID, 'player')}
                isVisited={node?.isVisited}
                hasContent={!!node?.content}
                noise={derived.noise.nodes[nodeID]}
              />
            } else {
              return <Spacer key={coordStr} />
            }
          })}
        </FlexCol>
      })}
    </>
    <FlexRow sx={{ position: 'absolute', flexGrow: 1 }}>
      <>
        {Object.entries(game.edges).map(([connecting, type]: [EdgeString, typeof game.edges[EdgeString]]) => {
          const [start, end] = connecting.split(':');
          const startNode = game.nodes[start];
          const endNode = game.nodes[end];

          const midX = (endNode.x + startNode.x) / 2;
          const midY = (endNode.y + startNode.y) / 2;

          const intervalsFromTop = midY - sizeList[0];
          const intervalsFromLeft = midX - sizeList[0];

          const dirs: Dir[] = midX === startNode.x ? ['up'] : ['left'];

          return <FlexRow
            key={coordToString({ x: midX, y: midY })}
            sx={{ position: 'absolute', top: 100 * intervalsFromTop, left: 100 * intervalsFromLeft }}
          >
            <Edge
              connecting={connecting}
              coord={coordToString({ x: midX, y: midY })}
              dirs={dirs}
            />
          </FlexRow>
        })}
      </>
    </FlexRow>
  </FlexRow>
}