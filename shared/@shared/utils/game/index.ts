import { Level } from '@shared/types/game/level';
import { Game, NodeMap } from '@shared/types/game';
import { ICE } from '@shared/constants/ice';
import { Installations } from '@shared/constants/installations';
import { Traps } from '@shared/constants/traps';
import { coordToString } from '@shared/utils/game/grid';

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

const spreadOrArg = <F extends (...args: any) => any>(fn: F, args: any): ReturnType<F> => {
  return Array.isArray(args) ? fn(...args) : fn(args);
}

const toContent = (content: Level['nodes'][string]['content']): Game['nodes'][string]['content'] => {
  return {
    type: content.type,
    status: content.status,
    ...(
      content.type === 'installation' ? spreadOrArg(Installations[content.key], content.args)
      : content.type === 'trap' ? spreadOrArg(Traps[content.key], content.args)
      : {}
    )
  }
}

export const gameFromLevel = (level: Level, player: Game['player']): Game => {
  const nodes = Object.entries(level.nodes).reduce((acc, [id, node]) => {
    acc[id] = {
      x: node.x,
      y: node.y,
      isVisited: node.isVisited,
      ice: node.ice ? spreadOrArg(ICE[node.ice.key], node.ice.args) : undefined,
      content: node.content ? toContent(node.content) : undefined
    };
    return acc;
  }, {} as Game['nodes']);

  return createGame({
    nodes,
    player,
    hovered: level.start
  });
}

// todo: validate game, eg. no two nodes for same coords.