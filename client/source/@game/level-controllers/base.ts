import { Game } from '@shared/types/game';

type OnChangeArgs = {
  game: Game;
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

  abstract onChange({ game }: OnChangeArgs): OnChangeArgs;
}