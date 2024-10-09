
export type Coord = { x: number, y: number };
export type CoordString = `${number},${number}`;
export type NodeID = `${string}`;
export type EdgeString = `${string}:${string}`;
export type Dir = 'up' | 'down' | 'right' | 'left';
export type CompassCardinal = 'N' | 'S' | 'E' | 'W';
export type CompassDir = CompassCardinal | 'NE' | 'NW' | 'SE' | 'SW';

export type IceStatus = 'READY' | 'ACTIVE' | 'BROKEN' | 'DEACTIVATED' | 'COMPLETE';

export type Ice<ID extends string = string> = {
  id: ID,
  layers: {
    status: 'ACTIVE' | 'BROKEN' | 'DEACTIVATED',
    effects: GameEffect[],
  }[],
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
  onCapture: (game: Game) => Game,
};

export type TrapEffect = {
  type: 'ram.reduce',
  amount: number,
} | {};

export type Trap = {
  id: string,
  amount?: number,
  duration?: number,
  activate: (game: Game) => Game,
}

export type NodeContent = {
  status: 'STANDBY' | 'OPENED',
} & (
  ({ type: 'trap' } & Trap) | ({ type: 'installation' } & Installation)
);

export type Node = {
  x: number,
  y: number,
  ice?: Ice,
  content?: NodeContent,
  isVisited?: boolean,
  isOpened?: boolean,
}

export type Condition = {
  id: string,
  until: number,
  onStart: (game: Game) => Game,
  onEnd: (game: Game) => Game,
}

export type Game = {
  mode: 'PLAY' | 'VIEW',
  nodes: Record<NodeID, Node>,
  edges: Record<EdgeString, 'oneway' | 'bi'>,
  hovered: NodeID,
  player: {
    mental: number,
    ram: {
      current: number,
      max: number,
    },
    money: number,
    actions: number,
    stats: {
      icebreaker: number,
    },
    conditions: Condition[],
  },
  stack: GameEffect[],
  round: number,
  history: {
    nodes: NodeID[],
    terminal: {
      type: 'command' | 'output' | 'error',
      value: string,
    }[],
  },
}

export type NodeMap = Record<CoordString, NodeID>;

export const COMMANDS = {
  'm': 'move',
  'next': true,
  'move': true,
  'nav': true,
  'info': true,
  'open': true,
  'retreat': true,
  'drill': true,
  'break': true,
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