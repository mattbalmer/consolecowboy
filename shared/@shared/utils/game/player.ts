import { Game, Player } from '@shared/types/game';
import { getDice } from '@shared/utils/game/index';
import { Scripts } from '@shared/constants/scripts';

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
  };
}