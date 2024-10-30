import { Vendor } from '@shared/types/game';
import { getTradeablePrice } from '@shared/utils/game/tradeables';

export const Vendors = {
  Johnny: () => ({
    id: 'Johnny',
    name: 'Johnny',
    canVisit: () => true,
    buying: [{
      type: 'item',
      urn: `item:UpgradeModule`,
      count: -1,
      price: getTradeablePrice(`item:UpgradeModule`, -1),
    }],
    selling: [{
      type: 'program',
      urn: `program:siphon1`,
      count: 1,
      price: getTradeablePrice(`program:siphon1`, 1),
    }],
  }),
} as const satisfies Record<string, (...args: unknown[]) => Vendor>
export type VendorID = keyof typeof Vendors;