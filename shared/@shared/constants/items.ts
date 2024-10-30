import { Item } from '@shared/types/game/items';

export const Items: {
  [id in string]: Item
} = {
  Money: {
    id: 'Money',
    name: 'Money',
    stackSize: -1,
    value: 1,
    format: (amount: number) => `$${amount}`,
  },
  AICore: {
    id: 'AICore',
    name: 'AI Core',
    value: 10e3,
    stackSize: 1,
  },
  UpgradeModule: {
    id: 'UpgradeModule',
    name: 'Upgrade Module',
    value: 10e2,
    stackSize: 10,
  },
};