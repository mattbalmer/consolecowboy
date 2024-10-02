import { FlexCol } from '@client/components/FlexCol';
import * as React from 'react';
import { Dir, NodeID, NodeMap } from '@game/types';
import { Box, Typography } from '@mui/material';
import { coordToString, getEdgeDirs } from '@game/utils/grid';

const Node = ({ id, coord, selected, exist }: {
  id: string,
  coord: string,
  selected: boolean,
  exist?: boolean,
}) => {
  return <Box
    data-key={coord}
    sx={{
      width: 50,
      height: 50,
      background: selected ? 'red' : exist === true ? 'blue' : '#222',
      border: '1px solid white',
      borderRadius: '50%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }}
  >
    <Typography variant={'subtitle1'}>{id}</Typography>
  </Box>
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

export const Grid = ({
  size,
  hoveredNodeXY,
  nodeMap,
}: {
  size: [number, number],
  hoveredNodeXY: NodeID,
  nodeMap: NodeMap,
}) => {
  const sizeList = Array
    .from({ length: size[1] - size[0] + 1 }, (_, i) => i + size[0])
    .reduce((s, n) => [...s, n, n + 0.5], [])
    .slice(0, -1);

  return <>
    {sizeList.slice(0).map(x => {
      return <FlexCol
        key={`${x}`}
        sx={{ alignItems: 'center' }}
      >
        {sizeList.slice(0).map(y => {
          const coordStr = coordToString({ x, y });
          if (x % 1 === 0 && y % 1 === 0) {
            return <Node
              id={nodeMap[coordStr]}
              coord={coordStr}
              key={coordStr}
              selected={coordStr === hoveredNodeXY}
              exist={coordStr in nodeMap}
            />
          } else {
            const dirs = getEdgeDirs(nodeMap, { x, y });
            return <Edge
              id={coordStr}
              key={coordStr}
              dirs={dirs}
            />
          }
        })}
      </FlexCol>
    })}
  </>
}