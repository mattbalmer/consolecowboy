import { Command, Game, Inventory, Player, Program, ProgramKeyword } from '@shared/types/game';
import { getDice } from '@shared/utils/game/index';
import { Scripts } from '@shared/constants/scripts';
import { CORE_COMMANDS } from '@shared/constants/commands';
import { Programs } from '@shared/constants/programs';
import { getTotalCount, mergeInventory } from '@shared/utils/game/inventory';
import { ItemID } from '@shared/types/game/items';

export const savedPlayerToGamePlayer = (savedPlayer: Player): Game['player'] => {
  return {
    node: null,
    mental: savedPlayer.mental,
    ram: {
      max: savedPlayer.ram.max,
      current: savedPlayer.ram.max,
      recovery: savedPlayer.ram.recovery,
    },
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

export const gamePlayerToSavedPlayer = (savedPlayer: Player, gamePlayer: Game['player']): Player => {
  const [inventory, excess] = mergeInventory(savedPlayer.inventory, gamePlayer.inventory);

  console.log('losing items', excess);

  return {
    ...savedPlayer,
    inventory,
    config: gamePlayer.config,
    mental: gamePlayer.mental,
  };
}

export const itemCount = <P extends { inventory: Inventory }>(player: P, item: ItemID): number => {
  return getTotalCount(player.inventory, item);
}