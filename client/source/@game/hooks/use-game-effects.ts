import { ComponentProps, useEffect, useState } from 'react';
import { GameEffects } from '@shared/constants/effects';
import { Game } from '@shared/types/game';
import { SimpleDialog } from '@client/components/SimpleDialog';

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

    if (effect) {
      console.log('trigger effect!', effect.id, { ...effect, trigger: null });

      if (effect.id === 'delay') {
        setGame((prev) => {
          return {
            ...prev,
            mode: 'VIEW',
          };
        });
        setTimeout(() => {
          setGame((prev) => {
            return {
              ...prev,
              mode: 'PLAY',
              stack: prev.stack.slice(1),
            }
          });
        }, effect['amount']);
      } else if((effect as ReturnType<typeof GameEffects.SimpleDialog>).id === 'dialog.simple') {
        console.log('trigger dialog effect');
        const dialogSettings = {
          title: (effect as ReturnType<typeof GameEffects.SimpleDialog>).title,
          body: (effect as ReturnType<typeof GameEffects.SimpleDialog>).body,
          acknowledge: (effect as ReturnType<typeof GameEffects.SimpleDialog>).acknowledge,
        };
        setDialog({
          ...dialogSettings,
          onClose: () => {
            console.log('onFinish dialog');
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
          },
        });
      } else {
        setGame((prev) => {
          prev.stack = prev.stack.slice(1);
          return {
            ...prev,
            ...effect.trigger(prev),
          }
        });
      }
      if (effect.id === 'finish.extraction') {
        onExtract(true);

        setGame(effect.trigger(game));

        setDialog({
          title: 'Extraction Complete',
          body: 'You have successfully connected to the external server, go back to the overworld.',
          acknowledge: 'Okay',
          onClose: () => {
            window.location.href = '/play';
            setDialog(null);
          },
        });
      }
      if (effect.id === 'finish.mental-drained') {
        onExtract(false);
        setGame(effect.trigger(game));
        setDialog({
          title: 'Mental Drained',
          body: `You've run out of mental energy - emergency eject from the net.`,
          acknowledge: 'Okay',
          onClose: () => {
            window.location.href = '/play';
            setDialog(null);
          },
        });
      }
    }
  }, [game.stack]);
}