import { Game, NodeMap } from '@game/types';
import { coordToString } from '@game/utils/grid';

export const invertNodes = (nodes: Game['nodes']): NodeMap => {
  const output: NodeMap = {};

  Object.entries(nodes).forEach(([nodeID, { x, y }]) => {
    output[coordToString({ x, y })] = nodeID;
  });

  return output;
}

export const getEdges = (nodes: Game['nodes']): Game['edges'] => {
  const output: Game['edges'] = {};
  const nodeMap = invertNodes(nodes);

  Object.entries(nodes).forEach(([nodeID, { x, y }]) => {
    const left = nodeMap[coordToString({ x: x - 1, y })];
    const right = nodeMap[coordToString({ x: x + 1, y })];
    const up = nodeMap[coordToString({ x, y: y - 1 })];
    const down = nodeMap[coordToString({ x, y: y + 1 })];

    [left, right, up, down].filter(Boolean).forEach((neighborID) => {
      const edgeKey = [nodeID, neighborID].sort().join(':');
      output[edgeKey] = 'bi';
    });
  });

  return output;
}

export const createGame = (partial: Pick<Game, 'nodes' | 'player' | 'hovered'>): Game => {
  const edges = getEdges(partial.nodes);

  return {
    ...partial,
    mode: 'PLAY',
    round: 0,
    edges,
    stack: [],
    history: {
      nodes: [],
      terminal: [],
    },
  };
}