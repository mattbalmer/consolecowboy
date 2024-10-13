import { Capsule } from '@yootil/capsule';
import { Player } from '@shared/types/game';

class PlayerCapsule extends Capsule<{
  player: Player,
}>{}

export const getInitialPlayerProps = () => {
  return {
    mental: 10,
    bodyHP: 5,
    ram: 3,
    money: 0,
    actions: 3,
    stats: {
      icebreaker: 1,
    },
    history: {},
  };
}

export const playerCapsule = new PlayerCapsule('netrunner', {
  player: getInitialPlayerProps(),
});