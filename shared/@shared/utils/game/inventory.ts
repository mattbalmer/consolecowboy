import { Inventory } from '@shared/types/game';
import { Items } from '@shared/constants/items';
import { ItemID } from '@shared/types/game/items';

export const getTotalCount = (inventory: Inventory, item: ItemID) =>
  inventory.reduce((acc, stack) => acc + (item === stack.item ? stack.count : 0), 0);

export const mergeInventory = (a: Inventory, b: Inventory, maxSize?: number): [inventory: Inventory, excess: Inventory] => {
  const inventory = a.slice(0);
  const excess = [];

  const hasSpace = (stack: Inventory[number]) => Items[stack.item].stackSize === -1 || stack.count < Items[stack.item].stackSize;

  const getInventory = (item: ItemID) => maxSize === undefined ? inventory
    : inventory.length < maxSize || inventory.some(stack => stack.item === item && hasSpace(stack)) ? inventory : excess;

  b.forEach(({ item, count }) => {
    while (count > 0) {
      const inv = getInventory(item);
      const i = inv.findLastIndex(e => e.item === item);

      if (i === -1) {
        inv.push({ item, count });
        break;
      }

      let remaining = Items[item].stackSize === -1
        ? count
        : Math.min(Items[item].stackSize - inv[i].count, count);

      if (remaining > 0) {
        inv[i] = {
          ...inv[i],
          count: inv[i].count + remaining,
        };
      } else {
        remaining = Math.min(count, Items[item].stackSize);
        inv.push({ item, count: remaining });
      }
      count -= remaining;
    }
  });

  return [inventory, excess];
}

export const formatItemCount = (item: ItemID, count: number) => {
  const format = Items[item].format;
  return format ? format(count) : `${count}`;
}

window['mergeInventory'] = mergeInventory;