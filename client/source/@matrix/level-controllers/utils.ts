import { GameEffects } from '@shared/constants/effects';
import { useState } from 'react';
import { Game } from '@shared/types/game';

export const delayDialog = (
  setGame: ReturnType<typeof useState<Game>>[1],
  dialog: Parameters<typeof GameEffects.SimpleDialog>[0],
  delay: number = 500
) => {
  if (delay === 0) {
    setGame(prev => {
      return {
        ...prev,
        stack: [
          ...prev.stack,
          GameEffects.SimpleDialog(dialog),
        ]
      }
    });
    return;
  }

  setTimeout(() => {
    setGame(prev => {
      return {
        ...prev,
        stack: [
          ...prev.stack,
          GameEffects.SimpleDialog(dialog),
        ]
      }
    })
  }, delay);
}