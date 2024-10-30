import { ComponentProps, useEffect, useState } from 'react';
import { GameEffects } from '@shared/constants/effects';
import { Game } from '@shared/types/game';
import { SimpleDialog } from '@client/components/SimpleDialog';
import { getGameDerived } from '@shared/utils/game';
import { runDaemons } from '@shared/utils/game/daemons';
import { playerCapsule } from '@client/capsules/player';
import { DEFAULT_ZONE } from '@shared/constants/zones';
import { overworldURL } from '@client/utils/navigation';

export const useGameEffects = ({
  game,
  setGame,
  setDialog,
  onExtract,
}: {
  game: Game,
  setGame: ReturnType<typeof useState<Game>>[1],
  setDialog: ReturnType<typeof useState<
    Omit<ComponentProps<typeof SimpleDialog>, 'id'>
  >>[1],
  onExtract: (success: boolean) => void,
}) => {
  useEffect(() => {
    const effect = game.stack[0];

    if (game.mode === 'FROZEN') {
      console.log('game frozen - processing no effects');
      return;
    }

    if (effect) {
      console.debug('trigger effect!', effect.id, { ...effect, trigger: null });

      if (effect.id === 'delay') {
        setGame((prev) => {
          return {
            ...prev,
            mode: 'VIEW',
            stack: prev.stack.slice(1),
          };
        });
        setTimeout(() => {
          setGame((prev) => {
            return {
              ...prev,
              mode: 'PLAY',
            }
          });
        }, effect['amount']);
      } else if((effect as ReturnType<typeof GameEffects.SimpleDialog>).id === 'dialog.simple') {
        console.debug('trigger dialog effect');
        const dialogSettings = {
          title: (effect as ReturnType<typeof GameEffects.SimpleDialog>).title,
          body: (effect as ReturnType<typeof GameEffects.SimpleDialog>).body,
          acknowledge: (effect as ReturnType<typeof GameEffects.SimpleDialog>).acknowledge,
        };
        const onClose = (effect as ReturnType<typeof GameEffects.SimpleDialog>).onClose;
        setDialog({
          ...dialogSettings,
          onClose: () => {
            console.debug('onFinish dialog');
            setGame((prev) => {
              return {
                ...prev,
                stack: prev.stack.slice(1),
                history: {
                  ...prev.history,
                  terminal: [
                    ...prev.history.terminal,
                    {
                      type: 'hidden',
                      value: `dialog: ${effect.id} | ${dialogSettings.title} | ${dialogSettings.body}`,
                    },
                  ],
                },
              };
            });
            setDialog(null);
            onClose?.();
          },
        });
      } else {
        setGame((prev) => {
          console.debug('trigger else', effect.id, prev.stack);
          prev.stack = prev.stack.slice(1);
          prev = {
            ...prev,
            ...effect.trigger(prev),
          };

          // run deaemons
          prev = runDaemons({
            game: prev,
            derived: getGameDerived(prev),
          });

          return prev;
        });
      }
      if (effect.id === 'finish.extraction') {
        onExtract(true);
        // setGame(effect.trigger(game));

        setDialog({
          title: 'Extraction Complete',
          body: 'You have successfully connected to the external server, go back to the overworld.',
          acknowledge: 'Okay',
          onClose: () => {
            window.location.href = overworldURL();
            setDialog(null);
          },
        });
      }

      if (effect.id === 'finish.mental-drained') {
        onExtract(false);
        // setGame(effect.trigger(game));

        setDialog({
          title: 'Mental Drained',
          body: `You've run out of mental energy - emergency eject from the net.`,
          acknowledge: 'Okay',
          onClose: () => {
            window.location.href = overworldURL();
            setDialog(null);
          },
        });
      }
    }
  }, [game.stack]);
}