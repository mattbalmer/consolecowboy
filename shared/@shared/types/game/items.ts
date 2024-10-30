import { Items } from '@shared/constants/items';

export type ItemID = keyof typeof Items;

export type Item = {
  id: string,
  name: string,
  stackSize: number,
  value: number,
  format?: (amount: number) => string,
}