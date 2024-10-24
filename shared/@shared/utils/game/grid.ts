import { Coord, CoordString, Dir, Game, NodeID, NodeMap } from '@shared/types/game';

export const coordToString = ({ x, y }: Coord): CoordString => `${x},${y}`;
export const stringToCoord = (str: CoordString): Coord => {
  const [x, y] = str.split(',').map(_ => Number(_));
  return { x, y };
};

// todo: this currently only does verticality, I think
export const getEdgeDirs = (nodeMap: Record<string, string>, { x, y }: Coord): Dir[] => {
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

export const getAdjacentCoords = (game: Game, node: NodeID = game.hovered): CoordString[] => {
  const allDirs: Dir[] = ['up', 'left', 'down', 'right'];
  const hoveredNode = game.nodes[node];

  const nodeMap = (() => {
    const keys = Object.keys(game.nodes);
    return Object.values(game.nodes).map(coordToString).reduce((m, coord, i) => {
      return {
        ...m,
        [coord]: keys[i],
      }
    }, {} as NodeMap);
  })();

  return allDirs
    .map(dir => {
      const x = dir === 'left' ? hoveredNode.x - 1 : dir === 'right' ? hoveredNode.x + 1 : hoveredNode.x;
      const y = dir === 'up' ? hoveredNode.y - 1 : dir === 'down' ? hoveredNode.y + 1 : hoveredNode.y;
      return coordToString({ x, y });
    })
    .filter(coord => coord in nodeMap);
}