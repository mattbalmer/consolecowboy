import { FlexCol } from '@client/components/FlexCol';
import * as React from 'react';
import { Dir, NodeID } from '@game/types';
import { Box } from '@mui/material';
import { coordToString, getEdgeDirs } from '@game/utils/grid';

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

export const Grid = ({
  size,
  hoveredNode,
  nodeMap,
}: {
  size: [number, number],
  hoveredNode: NodeID,
  nodeMap: Record<string, string>,
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
              id={coordStr}
              key={coordStr}
              selected={coordStr === hoveredNode}
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