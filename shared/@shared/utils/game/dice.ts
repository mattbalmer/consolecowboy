import { GameDie } from '@shared/types/game';

export const getDiceCounts = (dice: GameDie[], max: number = 6) => {
  const starter = Array.from({ length: max })
    .reduce<Record<number, number>>((a, _, i) => ({
      ...a,
      [i + 1]: 0,
    }), {});
  return dice.reduce((a, d) => {
    if (d.isAvailable) {
      return {
        ...a,
        [d.value]: (a[d.value] || 0) + 1,
      };
    } else {
      return a;
    }
  }, starter);
}