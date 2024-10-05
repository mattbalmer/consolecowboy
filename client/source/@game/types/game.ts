import { GameEffect } from '@game/constants/effects';
import { Game } from '@game/types/index';

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
  captureEffects: InstallationCaptureEffect[],
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

