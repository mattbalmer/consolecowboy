import { Command, COMMAND_ALIASES, CompassDir, CoreCommand, Game, GameDerived } from '@shared/types/game';
import { appendMessage, appendMessages } from '@shared/utils/game/cli';
import { CLIArgs } from '@shared/types/game/cli';
import { coordToString, getAdjacentCoords } from '@shared/utils/game/grid';
import { GameError } from '@shared/errors/GameError';
import { GameEffects } from '@shared/constants/effects';
import { pick } from '@shared/utils/objects';
import { getDice } from '@shared/utils/game';
import { consumeDice } from '@shared/utils/game/dice';
import { canExecute, executeContent } from '@shared/utils/game/servers';
import { Items } from '@shared/constants/items';
import { formatItemCount } from '@shared/utils/game/inventory';
import { ItemID } from '@shared/types/game/items';
import { commandMap } from '@shared/utils/game/decks';
import { removeRange } from '@shared/utils/arrays';
import { ensure } from '@shared/utils/game/game';

const Commands = {
  info: (game, args) => {
    const node = game.nodes[game.player.node];

    ensure(node, `Invalid node`);

    if (node.ice?.status === 'ACTIVE') {
      return appendMessage(game, {
        type: 'output',
        value: `ICE active - cannot get server info`
      });
    }

    const content = node.content;

    if (!content) {
      return appendMessage(game, {
        type: 'output',
        value: `Nothing installed`
      });
    }

    if (content.onInfo) {
      return content.onInfo(game, args);
    } else {
      return appendMessage(game, {
        type: 'output',
        value: `No information available`
      });
    }
  },
  deck: game => appendMessages(game,
    Object.entries(commandMap(game.player.deck)).map(([k, program]) => ({
      type: 'output',
      value: `${k.toLowerCase()}: ${program.id}`
    })),
  ),
  inv: game => {
    const stacks = game.player.inventory
      .reduce<Record<ItemID, {
        stacks: number,
        total: number,
      }>>((stacks, { item, count }) => {
        if (!stacks[item]) {
          stacks[item] = { stacks: 0, total: 0 };
        }
        stacks[item].stacks++;
        stacks[item].total += count;
        return stacks;
      }, {
        'Money': { stacks: 0, total: 0 },
      });

    return appendMessages(game,
      Object.entries(stacks).map(([item, { stacks, total }]) => ({
        type: `output`,
        value: `${Items[item].name}: ${formatItemCount(item, total)} (${stacks} GB)`
      }))
    );
  },
  scripts: (game: Game) => {
    const scripts = game.player.deck.scripts
      .map(s => s?.name)
      .filter(n => !!n);
    return appendMessage(game, {
      type: 'output',
      value: `Available scripts: ${scripts.join(', ')}`
    });
  },
  run: (game: Game, args: CLIArgs) => {
    const name = args._[0];

    if (args.help) {
      return appendMessage(game, {
        type: 'output',
        value: `Usage: run <script-name> [args]`
      });
    }

    if (!name) {
      throw new GameError(`No script name provided`);
    }

    // todo: some scripts may require action, but not all?
    const i = game.player.deck.scripts
      .findIndex((script) => script.name.toLowerCase() === name)

    const script = game.player.deck.scripts[i];

    if (!script) {
      throw new GameError(`Script not found: ${name}`);
    }

    game = appendMessage(game, {
      type: 'output',
      value: `Running script: ${script.name}`
    });

    game = script.onExecute(game, args);

    return {
      ...game,
      actionsToIncrement: game.actionsToIncrement + 1,
      player: {
        ...game.player,
        deck: {
          ...game.player.deck,
          scripts: removeRange(game.player.deck.scripts, i, 1),
        }
      },
    }
  },
  move: (game, args: CLIArgs<void, [target: string]>) => {
    if (args.help) {
      game = appendMessage(game, {
        type: 'output',
        value: `Usage: move <node> [-d <dice>]`
      });
      return appendMessage(game, {
        type: 'output',
        value: `<node> Must be the ID of an adjacent Node with a valid connection`
      });
    }

    if (game.player.actions < 1) {
      throw new GameError(`No actions left`);
    }

    const target = args._[0]?.toUpperCase();
    const validMoveCoords = getAdjacentCoords(game);
    const targetNode = game.nodes[target];

    if (!target || !targetNode) {
      throw new GameError(`Target not valid: ${target}`);
    }

    const targetCoord = coordToString(targetNode);

    if (!target || !validMoveCoords.includes(targetCoord)) {
      throw new GameError(`Cannot move to ${target}`);
    }

    try {
      game = consumeDice(game, args);
    } catch (error) {
      if (error instanceof GameError) {
        return appendMessage(game, {
          type: error.type,
          value: error.message,
        });
      } else {
        throw error;
      }
    }

    game.nodes[target].isVisited = true;
    game = {
      ...game,
      actionsToIncrement: game.actionsToIncrement + 1,
      player: {
        ...game.player,
        node: target,
      },
      history: {
        ...game.history,
        nodes: [...game.history.nodes, game.player.node],
      },
      stack: [
        ...game.stack,
        GameEffects.AddNoise({
          node: game.player.node,
          source: 'program',
          actor: 'player',
          amount: 1,
          round: game.round,
        }),
        GameEffects.AddNoise({
          node: target,
          source: 'program',
          actor: 'player',
          amount: 1,
          round: game.round,
        }),
      ],
    };

    if (game.nodes[target].ice) {
      game = game.nodes[target].ice.activate(game);
      if (!game) {
        throw new GameError(`ICE at ${target} failed to update game state`);
      }
    }

    return game;
  },
  nav: (game, args: CLIArgs<void, [CompassDir]>, derived) => {
    if (args.help) {
      game = appendMessage(game, {
        type: 'output',
        value: `Usage: nav <direction> [-d <dice>]`
      });
      return appendMessage(game, {
        type: 'output',
        value: `<direction> Must be a cardinal direction (n, e, s, w)`
      });
    }

    if (game.player.actions < 1) {
      throw new GameError(`No actions left`);
    }

    const [ dir ] = args._;

    if (!dir) {
      return;
    }

    const current = pick(game.nodes[game.player.node], 'x', 'y');
    const targetCoord = coordToString({
      x: current.x + (dir.includes('e') ? 1 : dir.includes('w') ? -1 : 0),
      y: current.y + (dir.includes('s') ? 1 : dir.includes('n') ? -1 : 0),
    });
    const target = derived.nodeMap[targetCoord];
    const validMoveCoords = getAdjacentCoords(game);

    if (!target || !validMoveCoords.includes(targetCoord)) {
      console.debug('cannot nav via', dir);
      return game;
    }

    try {
      game = consumeDice(game, args);
    } catch (error) {
      if (error instanceof GameError) {
        return appendMessage(game, {
          type: error.type,
          value: error.message,
        });
      } else {
        throw error;
      }
    }

    game.nodes[target].isVisited = true;
    game = {
      actionsToIncrement: game.actionsToIncrement + 1,
      ...game,
      player: {
        ...game.player,
        node: target,
      },
      history: {
        ...game.history,
        nodes: [...game.history.nodes, game.player.node],
      },
      stack: [
        ...game.stack,
        GameEffects.AddNoise({
          node: game.player.node,
          source: 'program',
          actor: 'player',
          amount: 1,
          round: game.round,
        }),
        GameEffects.AddNoise({
          node: target,
          source: 'program',
          actor: 'player',
          amount: 1,
          round: game.round,
        }),
      ],
    };

    if (game.nodes[target].ice) {
      game = game.nodes[target].ice.activate(game);
      if (!game) {
        throw new Error(`ICE at ${target} failed to update game state`);
      }
    }

    return game;
  },
  retreat: (game, args) => {
    if (args.help) {
      game = appendMessage(game, {
        type: 'output',
        value: `Usage: retreat [-d <dice>]`
      });
      return appendMessage(game, {
        type: 'output',
        value: `Moves to the player's previous node`
      });
    }

    if (game.player.actions < 1) {
      throw new GameError(`No actions left`);
    }

    const target = game.history.nodes[game.history.nodes.length - 1];
    const validMoveCoords = getAdjacentCoords(game);
    const targetNode = game.nodes[target.toUpperCase()];

    if (!target || !targetNode) {
      return;
    }
    const targetCoord = coordToString(targetNode);

    if (!target || !validMoveCoords.includes(targetCoord)) {
      console.debug('cannot retreat to', target);
      return game;
    }

    try {
      game = consumeDice(game, args);
    } catch (error) {
      if (error instanceof GameError) {
        return appendMessage(game, {
          type: error.type,
          value: error.message,
        });
      } else {
        throw error;
      }
    }

    game = {
      ...game,
      actionsToIncrement: game.actionsToIncrement + 1,
      player: {
        ...game.player,
        node: target,
      },
      history: {
        ...game.history,
        nodes: [...game.history.nodes, game.player.node],
      },
      stack: [
        ...game.stack,
        GameEffects.AddNoise({
          node: game.player.node,
          source: 'program',
          actor: 'player',
          amount: 1,
          round: game.round,
        }),
        GameEffects.AddNoise({
          node: target,
          source: 'program',
          actor: 'player',
          amount: 1,
          round: game.round,
        }),
      ],
    };

    if (game.nodes[target].ice) {
      game = game.nodes[target].ice.activate(game);
      if (!game) {
        throw new Error(`ICE at ${target} failed to update game state`);
      }
    }

    return game;
  },
  next: (game, args: CLIArgs) => {
    if (args.help) {
      return appendMessages(game, [{
        type: 'output',
        value: `Usage: next [-d <dice>]`
      }, {
        type: 'output',
        value: `Ends the player's turn`
      }]);
    }

    const newConditions = [];
    game.player.conditions.forEach(c => {
      if (c.until === game.round) {
        game = c.onEnd(game);
      } else {
        newConditions.push(c);
      }
    });
    game.player.conditions = newConditions;
    return {
      ...game,
      round: game.round + 1,
      actionsToIncrement: game.actionsToIncrement + 1,
      stack: [
        ...game.stack,
        GameEffects.AddNoise({
          node: game.player.node,
          source: 'program',
          actor: 'player',
          amount: 1,
          round: game.round,
        }),
      ],
      player: {
        ...game.player,
        actions: game.player.actionsPerTurn,
        dice: getDice(game.player.actionsPerTurn),
        ram: {
          ...game.player.ram,
          current: Math.min(game.player.ram.current + game.player.ram.recovery, game.player.ram.max),
        },
      },
    };
  },
  execute: (game, args, { hoveredNode }) => {
    if (args.help) {
      return appendMessages(game, [{
        type: 'output',
        value: `Usage: execute [-d <dice>]`
      }, {
        type: 'output',
        value: `Executes the content of the current node`
      }]);
    }

    if (!hoveredNode.content) {
      throw new GameError(`Nothing installed to run`);
    }

    if (hoveredNode?.ice && hoveredNode.ice.status === 'ACTIVE') {
      throw new GameError(`ICE is active - cannot execute`);
    }

    if (game.player.actions < 1) {
      throw new GameError(`No actions left`);
    }

    // or instead of auto, seeing the content is another progression system
    console.debug('run the hovered node. trigger trap effects or capture effects. this should maybe be auto? dunno');
    const node = game.nodes[game.player.node];

    // TODO: change that servers can only be executed once - for example, wallet could have a max per turn siphon amount, and a daemon could repeat each turn.
    ensure(canExecute(game, game.player.node, 'player'), `Server cannot be executed`);

    if (node.content.type === 'trap') {
      game = appendMessage(game, {
        type: 'output',
        value: `(${game.player.node}) Trap activated - ${node.content.id}`,
      });
      game = executeContent(game, game.player.node, 'player');
    }

    if (node.content.type === 'installation') {
      game = appendMessage(game, {
        type: 'output',
        value: `(${game.player.node}) Server content executed - ${node.content.id}`,
      });
      game = executeContent(game, game.player.node, 'player');
    }

    try {
      game = consumeDice(game, args);
    } catch (error) {
      if (error instanceof GameError) {
        return appendMessage(game, {
          type: error.type,
          value: error.message,
        });
      } else {
        throw error;
      }
    }

    return {
      ...game,
      actionsToIncrement: game.actionsToIncrement + 1,
      stack: [
        ...game.stack,
        GameEffects.AddNoise({
          node: game.player.node,
          source: 'program',
          actor: 'player',
          amount: 1,
          round: game.round,
          duration: 2,
        }),
        GameEffects.AddNoise({
          node: game.player.node,
          source: node.content.type,
          actor: 'network',
          amount: 1,
          round: game.round,
          duration: 2,
        }),
      ],
    };
  },
  config: (game, args) => {
    if (args.help) {
      return appendMessages(game, [{
        type: 'output',
        value: `Usage: config [key] [value]`
      }, {
        type: 'output',
        value: `Sets or retrieves a player configuration. If no value is provided, the current value is returned`
      }]);
    }

    const [key, value] = args._;

    if (!key) {
      const keys = Object.keys(game.player.config);
      keys.forEach(k => {
        game = appendMessage(game, {
          type: 'output',
          value: `${k}: ${typeof game.player.config[k] === 'string' ? `'${game.player.config[k]}'` : game.player.config[k]}`
        });
      });
      return game;
    }

    if (!value) {
      return appendMessage(game, {
        type: 'output',
        value: `'${game.player.config[key]}'`
      });
    }

    const parsedValue = value === 'true' ? true : value === 'false' ? false
      : !isNaN(Number(value)) ? Number(value)
        : value;

    return {
      ...game,
      player: {
        ...game.player,
        config: {
          ...game.player.config,
          [key]: parsedValue,
        },
      },
      history: {
        ...game.history,
        terminal: [
          ...game.history.terminal,
          {
            type: 'output',
            value: `set config '${key}' to '${parsedValue}'`,
          },
        ],
      },
    };
  },
} as const satisfies Record<CoreCommand, (game: Game, args: CLIArgs<any, any>, derived?: GameDerived) => Game>;
//
// export const CORE_COMMANDS = [
//   'info',
//   'config',
//   'move',
//   'nav',
//   'next',
//   'deck',
//   'inv',
//   //
//   'scripts',
//   'run',
//   //
//   'retreat',
//   // 'break',
//   // 'drill',
//   'execute',
// ] as const satisfies CoreCommand[];

export const commandAlias = (command: Command): Command => {
  if (typeof COMMAND_ALIASES[command] === 'string') {
    return COMMAND_ALIASES[command] as Command;
  }
  return command;
}

export const executeCommand = (command: Command, game: Game, args: CLIArgs, derived: GameDerived): Game => {
  const commandToProgram = commandMap(game.player.deck);
  const program = commandToProgram[command];

  if (program) {
    return program.onExecute({ game, args, derived, command });
  } else {
    throw new GameError(`Command not found: ${command}`);
  }
}

export const executeCoreCommand = (command: CoreCommand, game: Game, args: CLIArgs<any, any>, derived: GameDerived): Game => {
  if (command in Commands) {
    return Commands[command](game, args, derived);
  }

  return appendMessage(game, {
    type: 'error',
    value: `Command not found: ${command}`
  });
}
