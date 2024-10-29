import { GameError } from '@shared/errors/GameError';

export const ensure = <T extends any>(condition: T, message: string | string[]) => {
  if (!condition) {
    throw new GameError(message);
  }
}