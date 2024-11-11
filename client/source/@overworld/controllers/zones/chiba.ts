import type { OverworldState } from '@overworld/hooks/use-overworld';
import { FEEDBACK_URL } from '@client/constants/feedback';
import { OverworldController } from '@overworld/controllers/base';

export default class extends OverworldController {
  onChange(state: OverworldState) {
    const numLevelsPlayed = Object.entries(state.player.history)
      .filter((
          [level, [attempted, completed]]
        ) =>
          attempted > 0
      ).length;

    if (numLevelsPlayed === 0 && !state.misc.hasShownIntroDialog) {
      state.setMisc({ ...state.misc, hasShownIntroDialog: true });
      if (state.player.misc.skippedTutorial === undefined) {
        state.setShowConfirmTutorial(true);
      }
    }

    if (numLevelsPlayed === 0 && state.misc.hasShownIntroDialog && !state.misc.hasShownNewPlayerDialog && state.player.misc.skippedTutorial === false) {
      state.setMisc({ ...state.misc, hasShownNewPlayerDialog: true });
      state.setDialog({
        title: 'Welcome to Console Cowboy',
        body: 'To start, click Level 1 to enter the first hostile net',
        acknowledge: 'Let\'s Go',
        onFinish() {
          state.setDialog(null);
        },
      });
    }

    if (numLevelsPlayed === 0 && state.misc.hasShownIntroDialog && !state.misc.hasShownSkippedTutorialDialog && state.player.misc.skippedTutorial === true) {
      state.setMisc({ ...state.misc, hasShownSkippedTutorialDialog: true });
      state.setPlayer({
        ...state.player,
        deck: {
          ...state.player.deck,
          programs: {
            ...state.player.deck.programs,
            4: {
              type: 'program',
              content: `siphon1`,
            },
          },
        },
        history: {
          1: [1,1],
          2: [1,1],
          3: [1,1],
          4: [1,1],
          5: [1,1],
          6: [1,1],
          7: [1,1],
          8: [1,1],
          9: [1,1],
          10: [1,1],
          11: [0,0],
        },
        inventory: [{
          item: 'Money',
          count: 10_000,
        },{
          item: 'UpgradeModule',
          count: 5,
        }],
      });
      state.setDialog({
        title: 'Making Your Own Way',
        body: `Since you've played before - you won't need to play the Chiba levels again. You can advance to Shinjuku immediately!`,
        acknowledge: 'Ok',
        onFinish() {
          state.setDialog(null);
          window.location.href = `/play/zone/shinjuku`;
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

    if (state.extraction?.success) {
      const timesCompleted = state.player.history[state.extraction.levelID]?.[1];
      if (timesCompleted === 1) {
        state.setPlayer({
          ...state.player,
          xp: state.player.xp += 10,
        });
        state.setExtraction(null);

        if (state.extraction?.levelID === '1') {
          state.setDialog({
            title: 'Extraction Successful',
            body: 'You have successfully extracted from the level. Each time you do this, you will gain 10XP.',
            acknowledge: 'Continue',
            onFinish: () => {
              state.setDialog(null);
            },
          });
        }
      }
    }
  }
}
