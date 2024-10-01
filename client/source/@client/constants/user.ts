import { Self } from '@shared/types/users';

export const SELF: (Self | null) = window['__STATE__']?.self;