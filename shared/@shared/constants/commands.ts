import {
  Command,
  COMMANDS,
  CompassDir,
  Game,
  GameDerived,
  Inventory,
  Program,
  ProgramKeyword
} from '@shared/types/game';
import { appendMessage, appendMessages } from '@shared/utils/game/cli';
import { CLIArgs } from '@shared/types/game/cli';
import { removeRange } from '@shared/utils/arrays';
import { coordToString, getAdjacentCoords } from '@shared/utils/game/grid';
import { GameError } from '@shared/errors/GameError';
import { GameEffects } from '@shared/constants/effects';
import { pick } from '@shared/utils/objects';
import { getDice } from '@shared/utils/game';
import { consumeDice } from '@shared/utils/game/dice';
import { ProgramKeywords, Programs } from '@shared/constants/programs';
import { canExecute, executeContent } from '@shared/utils/game/servers';
import { Items } from '@shared/constants/items';
import { formatItemCount, mergeInventory } from '@shared/utils/game/inventory';
import { ItemID } from '@shared/types/game/items';

const Commands = {
  m: game => game,
  mv: game => game,
  x: game => game,
  info: (game, args) => {
    const content = game.nodes[game.player.node].content;

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
    Object.keys(game.player.deck).map(k => ({
      type: 'output',
      value: game.player.deck[k] === 'command'
        ? k
        : `${k.toLowerCase()}: ${game.player.deck[k].id}`
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
    return appendMessage(game, {
      type: 'output',
      value: `Available scripts: ${game.player.scripts.map(s => s.name).join(', ')}`
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
      return appendMessage(game, {
        type: 'error',
        value: `No script name provided`
      });
    }

    const i = game.player.scripts.findIndex(s => s.name.toLowerCase() === name);
    const script = game.player.scripts[i];

    if (i < 0) {
      return appendMessage(game, {
        type: 'error',
        value: `Script not found: ${name}`
      });
    }

    game = appendMessage(game, {
      type: 'output',
      value: `Running script: ${script.name}`
    });

    game = script.onExecute(game, args);

    return {
      ...game,
      player: {
        ...game.player,
        scripts: removeRange(game.player.scripts, i, 1),
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

    const target = args._[0]?.toUpperCase();
    const validMoveCoords = getAdjacentCoords(game);
    const targetNode = game.nodes[target];

    if (!target || !targetNode) {
      return appendMessage(game, {
        type: 'error',
        value: `Target not valid: ${target}`
      });
    }

    const targetCoord = coordToString(targetNode);

    if (!target || !validMoveCoords.includes(targetCoord)) {
      return appendMessage(game, {
        type: 'error',
        value: `Cannot move to ${target}`
      });
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
      game = game.nodes[target].ice.activate(game) ?? game;
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
      game = game.nodes[target].ice.activate(game) ?? game;
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
      game = game.nodes[target].ice.activate(game) ?? game;
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
  break: (game, args: CLIArgs<{ l: string }>, { hoveredNode }) => {
    if (args.help) {
      return appendMessages(game, [{
        type: 'output',
        value: `Usage: break [-l <layer>] [-d <dice>]`
      }, {
        type: 'output',
        value: `Breaks a layer of ICE on the current node. If no <layer> is given, breaks the first layer`
      }]);
    }

    const layer = parseInt(args.l) || 0;

    if (!hoveredNode.ice) {
      return appendMessage(game, {
        type: 'error',
        value: `No ICE to break`,
      });
    }

    if (isNaN(layer) || layer < 0 || layer >= hoveredNode.ice.layers.length) {
      return appendMessage(game, {
        type: 'error',
        value: `ICE has no layer '${layer}'`,
      });
    }

    if (hoveredNode.ice.layers[layer].status !== 'ACTIVE') {
      return appendMessage(game, {
        type: 'error',
        value: `Layer ${layer} is not active`,
      });
    }

    if (game.player.ram.current < 2) {
      return appendMessage(game, {
        type: 'error',
        value: `Not enough RAM to drill ICE`,
      });
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

    game = hoveredNode.ice.break(game, layer);

    // @ts-ignore
    const didBreakLayer = hoveredNode.ice.layers[layer].status === 'BROKEN';
    const isICEBroken = hoveredNode.ice.status === 'BROKEN';

    const diceUsed = args.d?.[0];
    const noiseGeneratedFromExcess = diceUsed - hoveredNode.ice.strength;

    return {
      ...game,
      player: {
        ...game.player,
        ram: {
          ...game.player.ram,
          current: Math.max(0, game.player.ram.current - 2),
        }
      },
      history: {
        ...game.history,
        terminal: [
          ...game.history.terminal,
          {
            type: 'output',
            value: didBreakLayer
              ? isICEBroken ? `(${game.player.node}) broke Lvl${hoveredNode.ice.strength} ${hoveredNode.ice.id}` : `(${game.player.node}) broke layer ${layer} of Lvl${hoveredNode.ice.strength} ${hoveredNode.ice.id}`
              : `Failed to break layer ${layer} of Lvl${hoveredNode.ice.strength} ${hoveredNode.ice.id}`,
          },
        ],
      },
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
        didBreakLayer ? GameEffects.AddNoise({
          node: game.player.node,
          source: 'ice',
          actor: 'network',
          amount: 1,
          round: game.round,
          duration: 2,
        }) : null,
        isICEBroken ? GameEffects.AddNoise({
          node: game.player.node,
          source: 'ice',
          actor: 'network',
          amount: noiseGeneratedFromExcess,
          round: game.round,
          duration: 3,
        }) : null,
      ],
    };
  },
  drill: (game, args, { hoveredNode }) => {
    if (args.help) {
      return appendMessages(game, [{
        type: 'output',
        value: `Usage: drill [-d <dice>]`
      }, {
        type: 'output',
        value: `Drills through the ICE on the current node. Suffer any effects from still active layers.`
      }]);
    }

    if (!hoveredNode.ice) {
      return appendMessage(game, {
        type: 'error',
        value: `No ICE to drill`,
      });
    }

    if (hoveredNode.ice.status !== 'ACTIVE') {
      return appendMessage(game, {
        type: 'error',
        value: `ICE is not active`,
      });
    }

    if (game.player.ram.current < 1) {
      return appendMessage(game, {
        type: 'error',
        value: `Not enough RAM to drill ICE`,
      });
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

    // complete all layers of ice
    game = hoveredNode.ice.complete(game);
    return {
      ...game,
      player: {
        ...game.player,
        ram: {
          ...game.player.ram,
          current: Math.max(0, game.player.ram.current - 1),
        }
      },
      history: {
        ...game.history,
        terminal: [
          ...game.history.terminal,
          {
            type: 'output',
            value: `(${game.player.node}) drilled through Lvl${hoveredNode.ice.strength} ${hoveredNode.ice.id}`,
          },
        ],
      },
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
          source: 'ice',
          actor: 'network',
          amount: 1,
          round: game.round,
          duration: 2,
        }),
      ],
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
      return appendMessage(game, {
        type: 'error',
        value: `Nothing installed to run`,
      });
    }

    // or instead of auto, seeing the content is another progression system
    console.debug('run the hovered node. trigger trap effects or capture effects. this should maybe be auto? dunno');
    const node = game.nodes[game.player.node];

    // TODO: change that servers can only be executed once - for example, wallet could have a max per turn siphon amount, and a daemon could repeat each turn.
    try {
      if (node.content.type === 'trap' && canExecute(game, game.player.node, 'player')) {
        game = appendMessage(game, {
          type: 'output',
          value: `(${game.player.node}) Trap activated - ${node.content.id}`,
        });
        game = executeContent(game, game.player.node, 'player');
      }

      if (node.content.type === 'installation' && canExecute(game, game.player.node, 'player')) {
        game = appendMessage(game, {
          type: 'output',
          value: `(${game.player.node}) Server content executed - ${node.content.id}`,
        });
        game = executeContent(game, game.player.node, 'player');
      }
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
} as const satisfies Record<Command, (game: Game, args: CLIArgs<any, any>, derived?: GameDerived) => Game>;

export const CORE_COMMANDS = [
  'info',
  'config',
  'move',
  'nav',
  'next',
  'deck',
  'inv',
  //
  'scripts',
  'run',
  //
  'retreat',
  'break',
  'drill',
  'execute',
] as const satisfies Command[];

export const commandAlias = (command: Command | ProgramKeyword): Command | ProgramKeyword => {
  if (typeof COMMANDS[command] === 'string') {
    return COMMANDS[command] as Command;
  }
  return command;
}

export const executeCommand = (command: Command | ProgramKeyword, game: Game, args: CLIArgs, derived: GameDerived): Game => {
  command = commandAlias(command);

  if (!(command in game.player.deck)) {
    return appendMessage(game, {
      type: 'error',
      value: `You don't have access to that command`
    });
  }

  if (command in Commands) {
    return Commands[command](game, args, derived);
  }

  if (command in ProgramKeywords) {
    const program = game.player.deck[command] as Program;
    return program.onExecute(game, args, derived);
  }

  return appendMessage(game, {
    type: 'error',
    value: `Command not found: ${command}`
  });
}
