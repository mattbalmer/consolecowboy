import type { OverworldState } from '@overworld/hooks/use-overworld';
import { useEffect } from 'react';
import { FEEDBACK_URL } from '@client/constants/feedback';

export const useOverworldController = (state: OverworldState) => {
  useEffect(() => {
    const numLevelsPlayed = Object.entries(state.player.history)
      .filter((
        [level, [attempted, completed]]
      ) =>
        attempted > 0
      ).length;

    if (numLevelsPlayed === 0 && !state.misc.hasShownIntroDialog) {
      state.setMisc({ ...state.misc, hasShownIntroDialog: true });
      state.setDialog({
        title: 'Welcome to Netrunner',
        body: 'To start, click Level 1 to enter the first hostile net',
        acknowledge: 'Let\'s Go',
        onFinish() {
          state.setDialog(null);
        },
      });
    }

    if (state.player.bodyHP < 1) {
      state.setMisc({ ...state.misc, hasShownDeadDialog: true });
      state.setDialog({
        title: `Death`,
        body: `After too much mental strain, your body has given out. Reset the game to try again.`,
        acknowledge: 'Ok',
        onFinish() {
          state.setDialog(null);
        },
      });
    }

    if (state.player.history['5']?.[1] > 0 && (state.player.history['6'] || [0,0])[0] < 1) {
      state.setMisc({ ...state.misc, hasShownFeedbackDialog: true });
      state.setDialog({
        title: `Feedback`,
        body: `Please give your feedback on the game so far. What did you like? What could be improved?`,
        acknowledge: 'Ok',
        onFinish() {
          state.setDialog(null);
          window.open(FEEDBACK_URL, '_blank');
        },
      });
    }
  }, [state.player.history]);

  return {};
}