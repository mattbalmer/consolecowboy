import * as React from 'react';
import { Self } from '@shared/types/users';
import { SELF } from '@client/constants/user';

export const useUser = () => {
  const userRef = React.useRef<Self | null>(SELF);

  return {
    user: userRef.current,
  }
}