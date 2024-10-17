import { Game, Player } from '@shared/types/game';
import { getDice } from '@shared/utils/game/index';

export const savedPlayerToGamePlayer = (savedPlayer: Player): Game['player'] => {
  return {
    mental: savedPlayer.mental,
    ram: {
      max: savedPlayer.ram,
      current: savedPlayer.ram,
    },
    money: savedPlayer.money,
    actions: savedPlayer.actions,
    actionsPerTurn: savedPlayer.actions,
    stats: {
      ...savedPlayer.stats,
    },
    conditions: [],
    dice: getDice(savedPlayer.dicePerRound),
  };
}