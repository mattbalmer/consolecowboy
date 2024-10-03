import { Installation } from '@game/types/game';

export const Installations = {
  Wallet: {
    id: 'wallet',
    captureEffects: [{
      type: 'money.increase',
      amount: 100,
    }]
  },
} as const satisfies Record<string, Installation>;