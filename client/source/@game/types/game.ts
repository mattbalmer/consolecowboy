export type IceEffect = {
  type: 'damage.mental',
  amount: number,
} | {};

export type Ice = {
  id: string,
  effects: IceEffect[]
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

