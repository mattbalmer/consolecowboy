import { Behavior, BehaviorArgs, Daemon, DaemonID, Game } from '@shared/types/game';
import { Daemons } from '@shared/constants/daemons';

export const executeBehaviors = (daemon: Daemon, behaviors: Behavior[], args: BehaviorArgs): Game => {
  let game = args.game;
  behaviors.forEach(behavior => {
    game = behavior.onExecute(daemon, { ...args, game });
  });
  return game;
}

export const runDaemons = (args: BehaviorArgs): Game => {
  let newGame = args.game;
  Object.entries(newGame.daemons).forEach(([daemonID, daemon]) => {
    if (daemon.onGameUpdate) {
      newGame = daemon.onGameUpdate({ ...args, game: newGame });
    } else {
      daemon.behaviors.forEach(([triggerOrTriggers, behaviorOrBehaviors]) => {
        const triggers = Array.isArray(triggerOrTriggers) ? triggerOrTriggers : [triggerOrTriggers];
        const behaviors = Array.isArray(behaviorOrBehaviors) ? behaviorOrBehaviors : [behaviorOrBehaviors];

        const shouldRun = triggers.every(trigger =>
          trigger.shouldRun(daemon, { ...args, game: newGame })
        );

        console.debug('testing daemon behavior', triggers.map(trigger => `${trigger.id}:${trigger.shouldRun(daemon, { ...args, game: newGame })}`), behaviors.map(behavior => behavior.id));

        if (shouldRun) {
          newGame = executeBehaviors(daemon, behaviors, { ...args, game: newGame });
        }
      });
    }
  });
  return newGame;
}

export class DaemonIDTracker {
  byType = new Map<keyof typeof Daemons, number>();

  next(type: keyof typeof Daemons): DaemonID {
    this.byType.set(type, (this.byType.get(type) ?? 0) + 1);
    return `${type}${this.byType.get(type)}` as DaemonID;
  }
}

export const terminateDaemon = (game: Game, daemonID: DaemonID): Game => {
  const oldStatus = game.daemons[daemonID].status;
  game.daemons[daemonID].status = 'TERMINATED';
  game = game.daemons[daemonID].onStatus?.(game, 'TERMINATED', oldStatus);
  delete game.daemons[daemonID]
  return game;
}