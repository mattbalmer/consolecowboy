export const Items = {
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
} as const satisfies {
  [id in string]: {
    id: id;
    name: string;
    stackSize: number;
    format?: (amount: number) => string;
  }
}
