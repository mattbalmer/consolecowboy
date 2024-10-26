import { Command, Game, Inventory, Player, Program, ProgramKeyword } from '@shared/types/game';
import { getDice } from '@shared/utils/game/index';
import { Scripts } from '@shared/constants/scripts';
import { CORE_COMMANDS } from '@shared/constants/commands';
import { Programs } from '@shared/constants/programs';
import { Items } from '@shared/constants/items';
import { ItemID } from '@shared/types/game/items';

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
        continue;
      }

      let remaining = Items[item].stackSize === -1
        ? count
        : Math.min(Items[item].stackSize - a[i].count, count);

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

export const savedPlayerToGamePlayer = (savedPlayer: Player): Game['player'] => {
  return {
    node: null,
    mental: savedPlayer.mental,
    ram: {
      max: savedPlayer.ram.max,
      current: savedPlayer.ram.max,
      recovery: savedPlayer.ram.recovery,
    },
    money: savedPlayer.money,
    actions: savedPlayer.actions,
    actionsPerTurn: savedPlayer.actions,
    stats: {
      ...savedPlayer.stats,
    },
    conditions: [],
    dice: getDice(savedPlayer.dicePerRound),
    config: savedPlayer.config,
    scripts: savedPlayer.scripts.map(({ id, props }) =>
      Scripts[id](props)
    ),
    inventory: [], // todo: allow player to specify some items to take with them into levels
    deck: Array.from(new Set([
      ...CORE_COMMANDS.map(e => `command:${e}`),
      ...savedPlayer.deck,
    ])).map(e => {
      const [type, id] = e.split(':');
      if (type === 'command') {
        return [id, 'command'] as [Command, 'command'];
      }
      if (type === 'program') {
        const program = Programs[id]() as Program;
        return [program.keyword, program] as [ProgramKeyword, Program];
      }
    }).reduce<
      Partial<Record<Command | ProgramKeyword, 'command' | Program>>
    >((map, [key, value]) => {
      map[key] = value;
      return map;
    }, {}),
  };
}