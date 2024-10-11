import { LevelController } from '@game/level-controllers/base';

import { Level1Controller } from '@game/level-controllers/1.level';

// TODO: make async and import only necessary files later
export const LevelControllers = {
  '1': Level1Controller,
} satisfies Record<string, typeof LevelController>;

export const getControllerFor = (levelID: string): LevelController => {
  if (LevelControllers.hasOwnProperty(levelID)) {
    const Controller = LevelControllers[levelID];
    const controller = new Controller();
    controller.bind(levelID);
    return controller;
  } else {
    return null;
  }
}