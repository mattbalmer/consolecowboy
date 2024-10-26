import { ItemID } from '@shared/types/game/items';

export const Items = {
  [ItemID.MONEY]: {
    id: ItemID.MONEY,
    name: 'Money',
    stackSize: -1,
    format: (amount: number) => `$${amount}`,
  },
  [ItemID.AI_CORE]: {
    id: ItemID.AI_CORE,
    name: 'AI Core',
    stackSize: 1,
  },
} as const satisfies {
  [id in ItemID]: {
    id: id;
    name: string;
    stackSize: number;
    format?: (amount: number) => string;
  }
}
