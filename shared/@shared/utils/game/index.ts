import { Level } from '@shared/types/game/level';
import {
  CoordString,
  Daemon,
  DaemonID,
  Game,
  GameDerived,
  GameDie,
  NodeID,
  NodeMap,
  NodeSpecifier,
  NoiseEvent
} from '@shared/types/game';
import { ICE } from '@shared/constants/ice';
import { Installations } from '@shared/constants/installations';
import { Traps } from '@shared/constants/traps';
import { coordToString, stringToCoord } from '@shared/utils/game/grid';
import { numberForStringID, stringIDForNumber } from '@shared/utils/strings';
import { generate } from '@shared/utils/arrays';
import { subBools } from '@shared/utils/booleans';
import { Daemons } from '@shared/constants/daemons';
import { DaemonIDTracker } from '@shared/utils/game/daemons';

export const nodeSpecifierToID = (nodes: Game['nodes'], nodeString: NodeSpecifier): NodeID => {
  if (nodeString in nodes) {
    return nodeString;
  }

  if (nodeString.includes(',')) {
    return invertNodes(nodes)[nodeString];
  }

  throw new Error(`Node ${nodeString} not found`);
}

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

export const createGame = (partial: Pick<Game, 'nodes' | 'player' | 'daemons' | 'daemonIDTracker' | 'idTracker'>): Game => {
  const edges = getEdges(partial.nodes);

  return {
    ...partial,
    mode: 'PLAY',
    round: 0,
    currentAction: 0,
    actionsToIncrement: 0,
    edges,
    noise: Object.keys(partial.nodes).reduce<Record<NodeID, []>>((a, n) => ({
      ...a,
      [n]: []
    }), {}),
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

const toContent = (content: Level['nodes'][CoordString]['content']): Game['nodes'][string]['content'] => {
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

export class IDTracker {
  private ids = new Set<number>();

  id(id?: string) {
    if (id) {
      const n = numberForStringID(id) - 1;
      if (this.ids.has(n)) {
        throw new Error(`ID ${id} already exists`);
      }
      this.ids.add(n);
      return id;
    } else {
      const next = this.next();
      this.ids.add(next);
      return stringIDForNumber(next + 1);
    }
  }

  next() {
    const sorted = Array.from(this.ids).sort((a, b) => a - b);

    if (sorted.length === 0) {
      return 0;
    }

    if (sorted.length === 1) {
      return sorted[0] === 0 ? 1 : 0;
    }

    const i = [-1, ...sorted].findIndex((e, i, a) =>
      i > 0 && a[i - 1] < e - 1
    );

    if (i < 0) {
      return sorted[sorted.length - 1] + 1;
    }

    return sorted[i - 2] + 1;
  }
}

export const getDice = (quantity: number): GameDie[] => {
  return generate(quantity, () => Math.floor(Math.random() * 6) + 1).map(value => ({
    value,
    isAvailable: true,
  })).sort((a, b) => {
    return a.value - b.value || subBools(a.isAvailable, b.isAvailable);
  });
};

export const gameFromLevel = (level: Level, player: Game['player']): Game => {
  const idTracker = new IDTracker();
  const daemonIDTracker = new DaemonIDTracker();
  const sorted = (Object.entries(level.nodes) as [CoordString, Level['nodes'][CoordString]][])
    .sort((a, b) => {
      const aCoord = stringToCoord(a[0]);
      const bCoord = stringToCoord(b[0]);
      const distFromCenterA = Math.abs(0 - aCoord.x) + Math.abs(0 - aCoord.y);
      const distFromCenterB = Math.abs(0 - bCoord.x) + Math.abs(0 - bCoord.y);
      return 'id' in a[1] ? -1 : 'id' in b[1] ? 1 : distFromCenterA - distFromCenterB || aCoord.x - bCoord.x;
    });

  const nodes = sorted
    .reduce((
      acc,
      [coordString, node]: [CoordString, Level['nodes'][CoordString]],
    ) => {
      const { x, y } = stringToCoord(coordString);
      const id = idTracker.id(node.id);
      acc[id] = {
        x: x,
        y: y,
        isVisited: node.isVisited,
        ice: node.ice ? spreadOrArg(ICE[node.ice.key], node.ice.args) : undefined,
        content: node.content ? toContent(node.content) : undefined
      };
      return acc;
    }, {} as Game['nodes']);

  const daemons = level.daemons?.reduce<Record<DaemonID, Daemon>>((daemons, levelDaemon) => {
    const daemon: Daemon = Daemons[levelDaemon.model]({
      id: daemonIDTracker.next(levelDaemon.model),
      node: nodeSpecifierToID(nodes, levelDaemon.node),
      status: levelDaemon.status,
      createdAtAction: 0,
      ...levelDaemon.args,
    } as any);
    daemon.onInit?.();
    daemons[daemon.id] = daemon;
    return daemons;
  }, {}) || {};

  player.node = level.start ? nodeSpecifierToID(nodes, level.start) : 'A';

  nodes[player.node].isVisited = true;

  return createGame({
    nodes,
    player,
    daemons,
    idTracker,
    daemonIDTracker,
  });
}
export const noiseAtNode = (round: number, events: NoiseEvent[]): number => {
  return events.reduce((sum, event) => {
    const decay = event.decay || 1;
    const duration = event.duration || 1;
    const lastRound = Math.min(round, event.round + duration);
    const roundsSince = round - lastRound;
    const noiseFromEvent = Math.max(0, event.amount - (roundsSince * decay));

    return sum + noiseFromEvent;
  }, 0);
}

export const getGameDerived = (game: Game): GameDerived => {
  const hoveredNodeXY = coordToString(game.nodes[game.player.node]);
  const nodeMap = invertNodes(game.nodes);
  const hoveredNode = game.nodes[nodeMap[hoveredNodeXY]];

  let totalNoise = 0;
  let highestNoise: [NodeID, number] = null;
  const noiseMap = Object.entries(game.noise).reduce<Record<NodeID, number>>(
    (map, [node, noiseEvents]) => {
      map[node] = noiseAtNode(game.round, noiseEvents);
      totalNoise += map[node];
      if (map[node] > 0 && (!highestNoise || map[node] > highestNoise[1])) {
        highestNoise = [node, map[node]];
      }
      return map;
    },
    {}
  );

  return {
    hoveredNode,
    nodeMap,
    noise: {
      nodes: noiseMap,
      total: totalNoise,
      highest: highestNoise,
    }
  };
}