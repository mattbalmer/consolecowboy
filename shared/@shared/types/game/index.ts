import { CLIArgs } from '@shared/types/game/cli';

export type Coord = { x: number, y: number };
export type CoordString = `${number},${number}`;
export type NodeID = `${string}`;
export type EdgeString = `${string}:${string}`;
export type Dir = 'up' | 'down' | 'right' | 'left';
export type CompassCardinal = 'N' | 'S' | 'E' | 'W';
export type CompassDir = CompassCardinal | 'NE' | 'NW' | 'SE' | 'SW';

export type IceStatus = 'READY' | 'ACTIVE' | 'BROKEN' | 'DEACTIVATED' | 'COMPLETE';
export type IceType = 'barrier' | 'sentry' | 'codegate';
export type Ice<ID extends string = string> = {
  id: ID,
  layers: {
    status: 'ACTIVE' | 'BROKEN' | 'DEACTIVATED',
    effects: GameEffect[],
  }[],
  types: IceType[],
  activationCount: number,
  strength: number,
  status: IceStatus,
  activate: (game: Game) => Game;
  complete: (game: Game) => Game;
  break: (game: Game, layer: number) => Game;
}

export type Content = {
  type: 'trap' | 'installation',
}

export type InstallationCaptureEffect = {
  type: 'money.increase',
  amount: number,
} | {};

export type Installation = {
  id: string,
  onExecute: (game: Game) => Game,
};

export type TrapEffect = {
  type: 'ram.reduce',
  amount: number,
} | {};

export type Trap = {
  id: string,
  amount?: number,
  duration?: number,
  onExecute: (game: Game) => Game,
}

export type Script <P = any> = {
  id: string,
  name: string,
  props: P,
  onExecute: (game: Game, args: CLIArgs) => Game,
}

export type GameDerived = {
  hoveredNode: GameNode,
  nodeMap: NodeMap,
  noise: {
    [nodeID: string]: number,
    total: number,
  },
}

export type BehaviorArgs = { game: Game, derived: GameDerived, command: Command, args: CLIArgs };

export type Trigger = {
  id: string,
  shouldRun: (daemon: Daemon, args: BehaviorArgs) => boolean,
}
export type Behavior <P = any> = {
  id: string,
  props: P,
  daemon: Daemon,
  onExecute: (args: BehaviorArgs) => {
    daemon: Daemon,
    game: Game,
  },
}

export type Daemon = {
  id: string,
  name: string,
  node: NodeID,
  status: 'ACTIVE' | 'STANDBY' | 'DEACTIVATED',
  conditions: Condition[],
  get behaviors(): [Trigger, Behavior[]][],
}

export type NodeContent = {
  status: 'STANDBY' | 'EXECUTED',
} & (
  ({ type: 'trap' } & Trap) | ({ type: 'installation' } & Installation)
);

export type GameNode = {
  x: number,
  y: number,
  ice?: Ice,
  content?: NodeContent,
  isVisited?: boolean,
  wasExecuted?: boolean,
}

export type Condition = {
  id: string,
  until: number,
  onStart: (game: Game) => Game,
  onEnd: (game: Game) => Game,
}

/**
 * Represents the player out-of-game, for saving purposes. The player on Game['player'] is the in-game player, with
 * status effects and other things we don't need to track between levels.
 */
export type Player = {
  mental: number,
  bodyHP: number,
  ram: {
    max: number,
    recovery: number,
  },
  money: number,
  actions: number,
  dicePerRound: number,
  xp: number,
  stats: {
    icebreaker: {
      barrier: number,
      sentry: number,
      codegate: number,
    },
  },
  /**
   * Record of level IDs to number of times entered & completed
   */
  history: Record<string, [entered: number, completed: number]>,
  config: {
    autonext: boolean,
    autodice: 'lowest' | 'highest' | null,
  },
  scripts: Pick<Script, 'id' | 'props'>[],
}

export type GameDie = {
  value: number,
  isAvailable: boolean,
}

export type CLIMessage = {
  type: 'command' | 'output' | 'error' | 'hidden',
  value: string,
}

export type NoiseActor = 'player' | 'daemon' | 'active-defense' | 'network';
// todo: figure out good way to abstract out differing types of related events, eg. trap activated vs broken, or ice drilled vs activated etc.
export type NoiseSource = 'program' | 'script' | 'ice' | 'trap' | 'installation';
export type NoiseEvent = {
  actor: NoiseActor,
  source: NoiseSource,
  amount: number,
  round: number,
  duration?: number,
  decay?: number,
};
export type NoiseMap = Record<NodeID, NoiseEvent[]>

export type Game = {
  mode: 'PLAY' | 'VIEW' | 'FROZEN',
  nodes: Record<NodeID, GameNode>,
  noise: NoiseMap,
  edges: Record<EdgeString, 'oneway' | 'bi'>,
  hovered: NodeID,
  player: {
    mental: number,
    ram: {
      current: number,
      max: number,
      recovery: number,
    },
    money: number,
    actions: number,
    actionsPerTurn: number,
    stats: Player['stats'],
    conditions: Condition[],
    dice: GameDie[], // make this a map, but somehow track max available for the round too
    config: Player['config'],
    scripts: Script[],
  },
  stack: GameEffect[],
  round: number,
  history: {
    nodes: NodeID[],
    terminal: CLIMessage[],
  },
  daemons: Daemon[],
}

export type NodeMap = Record<CoordString, NodeID>;

export const COMMANDS = {
  'm': 'move',
  'mv': 'move',
  'x': 'execute',
  'scripts': true,
  'run': true,
  'next': true,
  'move': true,
  'nav': true,
  'info': true,
  'execute': true,
  'retreat': true,
  'drill': true,
  'break': true,
  'config': true,
} as const;

export type Command = keyof typeof COMMANDS;
export type CommandArgs = {
  move: [string],
  info: [],
};

export type GameEffect<ID extends string = string> = {
  id: ID,
  trigger(game: Game): Game,
}