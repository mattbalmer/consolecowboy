import { UUID } from '@shared/types/generic';

export type User = {
  _id: UUID,
  profile: {
    name: string,
    avatar: string,
  },
  dates: {
    lastLoggedIn: number,
    created: number,
    updated: number,
  },
}

export type Self = User & {
  contact: {
    email: string,
  },
}
