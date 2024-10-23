import { Capsule } from '@yootil/capsule';
import { Game } from '@shared/types/game';

class TransitionsCapsule extends Capsule<{
  extraction?: {
    levelID: string,
    success: boolean,
    game: Game,
  },
}>{}

export const getInitialTransitionsProps = (): typeof TransitionsCapsule.prototype.typeref => {
  return {
  };
}

export const transitionsCapsule = new TransitionsCapsule('netrunner-transition', getInitialTransitionsProps());