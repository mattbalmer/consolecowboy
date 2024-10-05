import { GameEffect } from '@game/constants/effects';
import { Game } from '@game/types/index';

export type IceStatus = 'READY' | 'ACTIVE' | 'BROKEN' | 'DEACTIVATED';

export type Ice<ID extends string = string> = {
  id: ID,
  effects: (GameEffect[])[],
  activationCount: number,
  status: IceStatus,
  activate: (game: Game) => Game;
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
  effects: TrapEffect[]
}

