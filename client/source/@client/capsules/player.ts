import { Capsule } from '@yootil/capsule';
import { Player } from '@shared/types/game';

class PlayerCapsule extends Capsule<{
  player: Player,
}>{}

export const getInitialPlayerProps = (): Player => {
  return {
    mental: 10,
    bodyHP: 5,
    ram: {
      max: 3,
      recovery: 1,
    },
    actions: 3,
    dicePerRound: 3,
    xp: 0,
    stats: {
      icebreaker: {
        barrier: 1,
        codegate: 1,
        sentry: 1,
      },
      recon: {
        info: 1,
      },
      inventorySize: 4,
    },
    inventory: [],
    history: {},
    config: {
      autonext: false,
      autodice: 'lowest',
    },
    scripts: [],
    deck: [
      'program:siphon1'
    ],
  };
}

export const playerCapsule = new PlayerCapsule('consolecowboy', {
  player: getInitialPlayerProps(),
});