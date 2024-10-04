import { Ice, Installation, Trap } from '@game/types/game';
import { GameEffect } from '@game/constants/effects';

export type Coord = { x: number, y: number };
export type CoordString = `${number},${number}`;
export type NodeID = `${string}`;
export type EdgeString = `${string}:${string}`;
export type Dir = 'up' | 'down' | 'right' | 'left';

export type Node = {
  x: number,
  y: number,
  ice?: Ice,
  content?: ({ type: 'trap' } & Trap) | ({ type: 'installation' } & Installation),
  isVisited?: boolean,
  isOpened?: boolean,
}

export type Game = {
  nodes: Record<NodeID, Node>,
  edges: Record<EdgeString, 'oneway' | 'bi'>,
  hovered: NodeID,
  player: {
    mental: number,
    ram: number,
    money: number,
  },
  stack: GameEffect[]
}

export type NodeMap = Record<CoordString, NodeID>;

export const COMMANDS = {
  'm': 'move',
  'move': true,
  'info': true,
  'open': true,
} as const;

export type Command = keyof typeof COMMANDS;
export type CommandArgs = {
  move: [string],
  info: [],
};