import { BehaviorArgs, BehaviorPattern, Daemon, Game, NodeID } from '@shared/types/game';
import { Triggers } from '@shared/constants/triggers';
import { Behaviors, executeBehaviors, TargetSelectors } from '@shared/constants/behaviors';
import { appendMessage } from '@shared/utils/game/cli';
import { BehaviorPatterns } from '@shared/constants/behavior-patterns';

export const runDaemons = (args: BehaviorArgs): Game => {
  let newGame = args.game;
  newGame.daemons.forEach(daemon => {
    daemon.behaviors.forEach(([triggerOrTriggers, behaviorOrBehaviors]) => {
      const triggers = Array.isArray(triggerOrTriggers) ? triggerOrTriggers : [triggerOrTriggers];
      const behaviors = Array.isArray(behaviorOrBehaviors) ? behaviorOrBehaviors : [behaviorOrBehaviors];

      console.log('testing daemon behavior', triggers.map(trigger => trigger.id), behaviors.map(behavior => behavior.id));

      const shouldRun = triggers.every(trigger =>
        trigger.shouldRun(daemon, { ...args, game: newGame })
      );

      if (shouldRun) {
        newGame = executeBehaviors(daemon, behaviors, args);
      }
    });
  });
  return newGame;
}

export class DaemonIDTracker {
  byType = new Map<keyof typeof Daemons, number>();

  next(type: keyof typeof Daemons) {
    this.byType.set(type, (this.byType.get(type) ?? 0) + 1);
    return `${type}${this.byType.get(type)}`;
  }
}

export const Daemons = {
  SuicideHunter: (props: {
    id: string,
    node: NodeID,
    status?: Daemon['status'],
  }) => ({
    id: props.id,
    model: `SuicideHunter`,
    name: props.id,
    conditions: [],
    status: props.status ?? 'STANDBY',
    node: props.node,
    stats: {
      inventorySize: 0,
    },
    inventory: [],
    props: {
      noiseActivate: 3,
      noiseDeactivate: 2,
      damage: 2,
    },
    onStatus(game, newStatus, oldStatus) {
      if (newStatus === 'ACTIVE') {
        return appendMessage(game, {
          type: 'output',
          value: `Hunter activated at ${this.node}`,
        });
      }

      if (newStatus === 'TERMINATED') {
        return appendMessage(game, {
          type: 'output',
          value: `Hunter terminated at ${this.node}`,
        });
      }

      if (newStatus === 'STANDBY' && oldStatus === 'ACTIVE') {
        return appendMessage(game, {
          type: 'output',
          value: `Hunter at ${this.node} went into sleep mode.`,
        });
      }
    },
    get behaviors() {
      return [
        BehaviorPatterns.MoveToNoise({ min: this.props.noiseActivate }),
        [
          [Triggers.IsStatus('ACTIVE'), Triggers.NoiseAtNode({
            node: 'any',
            max: this.props.noiseDeactivate,
          })],
          Behaviors.SetStatus({ status: 'STANDBY' }),
        ],
        [
          [Triggers.IsStatus('STANDBY'), Triggers.NoiseAtNode({
            node: 'any',
            min: this.props.noiseActivate,
          })],
          Behaviors.SetStatus({ status: 'ACTIVE' }),
        ],
        BehaviorPatterns.ExplodeAtPlayer({ damage: this.props.damage })
      ] as BehaviorPattern;
    },
  }),
} as const satisfies Record<string, (...args: unknown[]) => Daemon>;