import { Game, Inventory, Player } from '@shared/types/game';
import { getDice } from '@shared/utils/game/index';
import { formatItemCount, getTotalCount, mergeInventory } from '@shared/utils/game/inventory';
import { ItemID } from '@shared/types/game/items';
import { hydrateDeck } from '@shared/utils/game/decks';

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
    inventory: [], // todo: allow player to specify some items to take with them into levels
    deck: hydrateDeck(savedPlayer.deck),
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

export const itemCountFormatted = <P extends { inventory: Inventory }>(container: P, item: ItemID): string => {
  return formatItemCount(item, getTotalCount(container.inventory, item));
}