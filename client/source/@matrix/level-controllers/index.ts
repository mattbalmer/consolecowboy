import { LevelController } from '@matrix/level-controllers/base';

// TODO: make async and import only necessary files later
export const LevelControllers = [
  require('@matrix/level-controllers/1.level').default,
  require('@matrix/level-controllers/2.level').default,
  require('@matrix/level-controllers/3.level').default,
  require('@matrix/level-controllers/4.level').default,
  require('@matrix/level-controllers/5.level').default,
].reduce<
  Record<string, new () => LevelController>
>((a, C) => {
  const l = new C().levelID;
  a[l] = C;
  return a;
}, {});

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