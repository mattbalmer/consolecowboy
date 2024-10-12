import { useState } from 'react';
import { Capsule } from '@yootil/capsule';

export const useCapsuleField = <T extends Record<string, any>, K extends keyof T>(capsule: Capsule<T>, key: K) => {
  const [state, setState] = useState<T[K]>(capsule.get(key));

  const setValue = (newValue: T[K]) => {
    capsule.set(key, newValue);
    setState(newValue);
  };

  return [state, setValue] as const;
}
