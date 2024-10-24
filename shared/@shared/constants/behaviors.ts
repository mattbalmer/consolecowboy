import {
  Behavior,
  BehaviorArgs,
  Coord,
  Daemon,
  Game,
  GameDerived,
  NodeID
} from '@shared/types/game';
import { coordToString, getAdjacentCoords, stringToCoord } from '@shared/utils/game/grid';
import { insertIntoCopy } from '@shared/utils/arrays';
import { GameEffects } from '@shared/constants/effects';

const insertByFirstAsc = <T extends any>(array: [number, ...T[]][], first: number, rest: T[]): [number, ...T[]][] => {
  const i = array.findIndex(([n]) => first <= n);
  if (i === 0) {
    return [
      [first, ...rest],
      ...array,
    ];
  }
  if (i < 0) {
    return [
      ...array,
      [first, ...rest],
    ];
  }
  return insertIntoCopy(array, i, [[first, ...rest]]);
}

const pathToNode = (game: Game, derived: GameDerived, from: NodeID, to: NodeID) => {
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

  console.log('starting pathfinding', { from, to, fromCoords, toCoords, paths, current });

  while (current !== to) {
    if (paths.length < 1) {
      return;
    }
    const [dist, ...path] = paths.shift();
    current = derived.nodeMap[coordToString(path[path.length - 1])];
    console.log('head', { dist, current, path });

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
      console.log('adjacent found', { dist: adjacent[0], path: next });

      if (derived.nodeMap[coordToString(next[next.length - 1])] === to) {
        return next;
      }
    });
  }

  return paths[0].slice(1) as Coord[];
}

export const Behaviors = {
  MoveToNoise: (daemon: Daemon, props?: {
    min: number,
  }) => ({
    id: `MoveToNoise`,
    props: {
      min: props?.min ?? 2,
    },
    daemon,
    onExecute(this: Behavior, { game, derived }: BehaviorArgs): { daemon: Daemon, game: Game } {
      const { daemon } = this;
      const [highestNoiseNode] = Object.entries(derived.noise).reduce((highest, [nodeID, noise]) => {
        if (noise < highest[1]) return highest;
        return [nodeID, noise];
      }, [null, 0]);
      if (highestNoiseNode) {
        const path = pathToNode(game, derived, daemon.node, highestNoiseNode);
        if (!path) {
          console.log('no valid path found - doing nothing');
          return { game, daemon };
        } else {
          console.log('moving to next node in path', path);
          daemon.node = derived.nodeMap[coordToString(path[1])];
          return { game, daemon };
        }
      } else {
        console.log('No noise found - doing nothing');
        return { game, daemon };
      }
    },
  }),
  MoveToPlayer: (daemon: Daemon) => ({
    id: `MoveToPlayer`,
    props: {},
    daemon,
    onExecute(this: Behavior, { game, derived }: BehaviorArgs): { daemon: Daemon, game: Game } {
      console.log('ex', this);
      const { daemon } = this;
      if (daemon.node === game.player.node) {
        console.log('already at player - doing nothing');
        return { game, daemon };
      }
      console.log('moving to player', daemon.node, game.player.node);
      const path = pathToNode(game, derived, daemon.node, game.player.node);
      if (!path) {
        console.log('no valid path found - doing nothing');
        return { game, daemon };
      } else {
        console.log('moving to next node in path', path);
        daemon.node = derived.nodeMap[coordToString(path[1])];
        return { game, daemon };
      }
    },
  }),
  AttackMental: (daemon: Daemon, props: {
    amount: number,
  }) => ({
    id: `AttackMental`,
    props,
    daemon,
    onExecute(this: Behavior, { game }: BehaviorArgs): { daemon: Daemon, game: Game } {
      const { daemon } = this;
      game.stack = [
        ...game.stack,
        GameEffects.MentalDamage({ amount: this.props.amount }),
      ];
      return { game, daemon };
    },
  }),
  SelfDestruct: (daemon: Daemon) => ({
    id: `SelfDestruct`,
    props: {},
    daemon,
    onExecute(this: Behavior, { game }: BehaviorArgs): { daemon: Daemon, game: Game } {
      const { daemon } = this;
      daemon.status = 'DEACTIVATED';
      game.daemons = game.daemons.filter(d => d.id !== daemon.id);
      return { game, daemon };
    },
  }),
} as const satisfies Record<string, (...args: unknown[]) => Behavior>;