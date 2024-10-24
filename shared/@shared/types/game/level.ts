import { Content, CoordString, Daemon, IceStatus, NodeContent, NodeID } from '@shared/types/game/index';
import { ICE } from '@shared/constants/ice';
import { Installations } from '@shared/constants/installations';
import { Traps } from '@shared/constants/traps';
import { Daemons } from '@shared/constants/daemons';

// TODO idealistic
// export type LevelICE<K extends keyof typeof ICE> = {
//   key: K,
//   status: IceStatus,
//   args: Parameters<typeof ICE[K]>
// }
//
// export type LevelContent<T extends Content['type'], K extends T extends 'installation' ? keyof typeof Installations : keyof typeof Traps> = {
//   type: T,
//   key: K,
//   status: NodeContent['status'],
//   // args: Parameters<T extends 'installation' ? typeof Installations[K] : typeof Traps[K]>
//   args: T extends 'installation' ? Parameters<typeof Installations[K]> : Parameters<typeof Traps[K]>
// }

export type LevelICE<K extends keyof typeof ICE> = {
  key: K,
  status: IceStatus,
  args: Record<string, unknown> | unknown[] | null | undefined,
}

export type LevelContent<T extends Content['type'], K extends T extends 'installation' ? keyof typeof Installations : keyof typeof Traps> = {
  type: T,
  key: K,
  status: NodeContent['status'],
  args: Record<string, unknown> | unknown[] | null | undefined,
}

export type LevelDaemon<K extends keyof typeof Daemons> = {
  model: K,
  node: Daemon['node'],
  status: Daemon['status'],
  args: Record<string, unknown> | null | undefined,
}

export type Level = {
  nodes: Record<CoordString, {
    id?: NodeID,
    isVisited?: boolean,
    ice?: LevelICE<keyof typeof ICE>
    content?: LevelContent<Content['type'], any>,
  }>,
  start: string,
  offset?: [x: number, y: number],
  daemons?: LevelDaemon<keyof typeof Daemons>[],
}
