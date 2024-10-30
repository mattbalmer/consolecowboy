import { Vendor } from '@shared/types/game';
import { getTradeablePrice } from '@shared/utils/game/tradeables';

export const Vendors = {
  Johnny: () => ({
    id: 'Johnny',
    name: 'Johnny',
    canVisit: () => true,
    inventory: [{
      type: 'program',
      urn: `program:siphon1`,
      count: 1,
      price: getTradeablePrice(`program:siphon1`),
    }],
    buying: [{
      type: 'item',
      urn: `item:UpgradeModule`,
      count: 10,
      price: getTradeablePrice(`item:UpgradeModule`),
    }],
    selling: [{
      type: 'program',
      urn: `program:siphon1`,
      count: -1,
      price: getTradeablePrice(`program:siphon1`),
    }],
  }),
} as const satisfies Record<string, (...args: unknown[]) => Vendor>
export type VendorID = keyof typeof Vendors;