import type { OverworldState } from '@overworld/hooks/use-overworld';
import { OverworldPage } from '@overworld/types';
import { ZoneID } from '@shared/constants/zones';

// export type OverworldController<T extends any = void> = (state: OverworldState) => T;

export abstract class OverworldController {
  abstract onChange(state: OverworldState): void;
  onBind?(args: { page: OverworldPage, zoneID: ZoneID }): void;
}