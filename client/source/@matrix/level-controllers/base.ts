import { Command, Game } from '@shared/types/game';
import { CLIArgs } from '@shared/types/game/cli';
import { useState } from 'react';

type OnChangeArgs = {
  game: Game;
  setGame: ReturnType<typeof useState<Game>>[1]
}

export abstract class LevelController {
  abstract levelID: string;

  bind(levelID: string): void {
    if (levelID === this.levelID) {
      console.log(`Binding level controller for ${levelID}`);
      if (this.onBind) {
        this.onBind();
      }
    } else {
      console.log(`Cannot bind controller on ${levelID} using controller for ${this.levelID}`);
    }
  }

  onBind?(): void;

  abstract onChange({ game, setGame }: OnChangeArgs): {
    game: Game,
  };
  abstract onCommand(game: Game, command: Command, args: CLIArgs): {
    game?: Game,
    command?: Command,
    args?: CLIArgs,
    shouldContinue: boolean,
  } | void;
}