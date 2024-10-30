import { Capsule } from '@yootil/capsule';
import { Game } from '@shared/types/game';

class TransitionsCapsule extends Capsule<{
  extraction?: {
    levelID: string,
    success: boolean,
    game: Game,
  },
  hasShownReplayDialog?: boolean,
}>{}

export const getInitialTransitionsProps = (): typeof TransitionsCapsule.prototype.typeref => {
  return {
    hasShownReplayDialog: false,
  };
}

export const transitionsCapsule = new TransitionsCapsule('consolecowboy-transition', getInitialTransitionsProps());