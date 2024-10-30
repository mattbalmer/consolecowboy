import { Vendor } from '@shared/types/game';

export const Vendors = {
  Johnny: () => ({
    id: 'Johnny',
    name: 'Johnny',
    buying: [],
    selling: [],
  }),
} as const satisfies Record<string, (...args: unknown[]) => Vendor>