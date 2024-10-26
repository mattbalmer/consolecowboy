export const Items: {
  [id in string]: {
    id: id;
    name: string;
    stackSize: number;
    format?: (amount: number) => string;
  }
} = {
  Money: {
    id: 'Money',
    name: 'Money',
    stackSize: -1,
    format: (amount: number) => `$${amount}`,
  },
  AICore: {
    id: 'AICore',
    name: 'AI Core',
    stackSize: 1,
  },
  UpgradeModule: {
    id: 'UpgradeModule',
    name: 'Upgrade Module',
    stackSize: 10,
  },
};