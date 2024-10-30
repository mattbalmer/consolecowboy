import type { OverworldState } from '@overworld/hooks/use-overworld';

export type OverworldController<T extends any = void> = (state: OverworldState) => T;