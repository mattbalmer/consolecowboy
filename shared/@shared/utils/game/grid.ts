import { Coord, CoordString, Dir, Game, GameDerived, NodeID, NodeMap } from '@shared/types/game';
import { insertByFirstAsc, insertIntoCopy } from '@shared/utils/arrays';

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

export const getAdjacentCoords = (game: Game, node: NodeID = game.player.node): CoordString[] => {
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

export const pathToNode = (game: Game, derived: GameDerived, from: NodeID, to: NodeID) => {
  if (!game.nodes[from] || !game.nodes[to]) {
    return;
  }
  const fromCoords = { x: game.nodes[from].x, y: game.nodes[from].y };
  const toCoords = { x: game.nodes[to].x, y: game.nodes[to].y };

  const distanceTo = (coord: Coord) =>
    Math.sqrt((coord.x - toCoords.x) ** 2 + (coord.y - toCoords.y) ** 2);

  let paths = [
    [distanceTo(fromCoords), fromCoords]
  ] as unknown as [number, ...Coord[]][];
  let current = derived.nodeMap[coordToString(fromCoords)];

  console.debug('starting pathfinding', { from, to, fromCoords, toCoords, paths, current });

  while (current !== to) {
    if (paths.length < 1) {
      return;
    }
    const [dist, ...path] = paths.shift();
    current = derived.nodeMap[coordToString(path[path.length - 1])];
    console.debug('head', { dist, current, path });

    if (!current) {
      return;
    }
    if (current === to) {
      return path;
    }

    const neighbors = getAdjacentCoords(game, current)
      .filter(coord => coord in derived.nodeMap)
      .map(stringToCoord);
    const adjacents = neighbors.map<
      [number, ...Coord[]]
    >((neighbor) => {
      return [distanceTo(neighbor), ...path, neighbor];
    }).sort((a, b) => a[0] - b[0]);

    adjacents.forEach((adjacent) => {
      const next = adjacent.slice(1) as Coord[];
      paths = insertByFirstAsc<Coord>(paths, adjacent[0], next);
      console.debug('adjacent found', { dist: adjacent[0], path: next });

      if (derived.nodeMap[coordToString(next[next.length - 1])] === to) {
        return next;
      }
    });
  }

  return paths[0].slice(1) as Coord[];
}