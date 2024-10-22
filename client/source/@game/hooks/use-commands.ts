import { Command, CompassDir, Game } from '@shared/types/game';
import { getDice } from '@shared/utils/game';
import { useCallback, useState } from 'react';
import { coordToString, getAdjacentCoords } from '@shared/utils/game/grid';
import { replace } from '@shared/utils/arrays';
import { pick } from '@shared/utils/objects';
import { GameDerived } from '@game/hooks/use-game';
import { CLIArgs } from '@shared/types/game/cli';
import { getDiceCounts } from '@shared/utils/game/dice';
import { appendMessage, parseArgs } from '@shared/utils/game/cli';
import { GameError } from '@shared/errors/GameError';
import { LevelController } from '@game/level-controllers/base';

const consumeDice = (game: Game, args: CLIArgs<Record<string, any>, any>): Game => {
  const dice = args.d?.[0];

  if (!dice) {
    throw new GameError('No valid dice given');
  }

  if (getDiceCounts(game.player.dice)[dice] < 1) {
    throw new GameError(`No available dice of value ${dice}`);
  }

  const diceIndex = game.player.dice.findIndex(d => d.value === dice && d.isAvailable);

  if (diceIndex < 0) {
    console.log('error allocating dice used', dice, diceIndex, game.player.dice);
    throw new GameError(`Error allocating dice usage (-d ${args.d})`);
  }

  return {
    ...game,
    player: {
      ...game.player,
      actions: game.player.actions - 1,
      dice: replace(game.player.dice, diceIndex, [{
        value: dice,
        isAvailable: false,
      }]),
    },
  };
}

const Commands = {
  m: game => game,
  x: game => game,
  info: game => game,
  move: (game, args: CLIArgs<void, [target: string]>) => {
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
      hovered: target,
      history: {
        ...game.history,
        nodes: [...game.history.nodes, game.hovered],
      },
    };

    if (game.nodes[target].ice) {
      game = game.nodes[target].ice.activate(game) ?? game;
    }

    return game;
  },
  nav: (game, args: CLIArgs<void, [CompassDir]>, derived) => {
    const [ dir ] = args._;

    if (!dir) {
      return;
    }

    const current = pick(game.nodes[game.hovered], 'x', 'y');
    const targetCoord = coordToString({
      x: current.x + (dir.includes('e') ? 1 : dir.includes('w') ? -1 : 0),
      y: current.y + (dir.includes('s') ? 1 : dir.includes('n') ? -1 : 0),
    });
    const target = derived.nodeMap[targetCoord];
    const validMoveCoords = getAdjacentCoords(game);

    if (!target || !validMoveCoords.includes(targetCoord)) {
      console.log('cannot nav via', dir);
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
      hovered: target,
      history: {
        ...game.history,
        nodes: [...game.history.nodes, game.hovered],
      },
    };

    if (game.nodes[target].ice) {
      game = game.nodes[target].ice.activate(game) ?? game;
    }

    return game;
  },
  retreat: (game, args) => {
    const target = game.history.nodes[game.history.nodes.length - 1];
    const validMoveCoords = getAdjacentCoords(game);
    const targetNode = game.nodes[target.toUpperCase()];

    if (!target || !targetNode) {
      return;
    }
    const targetCoord = coordToString(targetNode);

    if (!target || !validMoveCoords.includes(targetCoord)) {
      console.log('cannot retreat to', target);
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
      hovered: target,
      history: {
        ...game.history,
        nodes: [...game.history.nodes, game.hovered],
      },
    };

    if (game.nodes[target].ice) {
      game = game.nodes[target].ice.activate(game) ?? game;
    }

    return game;
  },
  next: game => {
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
      player: {
        ...game.player,
        actions: game.player.actionsPerTurn,
        dice: getDice(game.player.actionsPerTurn),
      },
    };
  },
  break: (game, args: CLIArgs<{ l: string }>, { hoveredNode }) => {
    const layer = parseInt(args.l);

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

    return {
      ...game,
      history: {
        ...game.history,
        terminal: [
          ...game.history.terminal,
          {
            type: 'output',
            value: didBreakLayer
              ? isICEBroken ? `(${game.hovered}) broke Lvl${hoveredNode.ice.strength} ${hoveredNode.ice.id}` : `(${game.hovered}) broke layer ${layer} of Lvl${hoveredNode.ice.strength} ${hoveredNode.ice.id}`
              : `Failed to break layer ${layer} of Lvl${hoveredNode.ice.strength} ${hoveredNode.ice.id}`,
          },
        ],
      },
    };
  },
  drill: (game, args, { hoveredNode }) => {
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
      history: {
        ...game.history,
        terminal: [
          ...game.history.terminal,
          {
            type: 'output',
            value: `(${game.hovered}) drilled through Lvl${hoveredNode.ice.strength} ${hoveredNode.ice.id}`,
          },
        ],
      },
    };
  },
  execute: (game, args, { hoveredNode }) => {
    if (!hoveredNode.content) {
      return appendMessage(game, {
        type: 'error',
        value: `Nothing installed to run`,
      });
    }

    if (hoveredNode.content.status === 'EXECUTED' || hoveredNode.wasExecuted) {
      return appendMessage(game, {
        type: 'error',
        value: `Already executed`,
      });
    }

    // or instead of auto, seeing the content is another progression system
    console.log('run the hovered node. trigger trap effects or capture effects. this should maybe be auto? dunno');
    const node = game.nodes[game.hovered];

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

    // todo: no more 2 sources of truth
    node.wasExecuted = true;
    node.content.status = 'EXECUTED';

    if (node.content.type === 'trap') {
      game = appendMessage(game, {
        type: 'output',
        value: `(${game.hovered}) Trap activated - ${node.content.id}`,
      });
      game = node.content.onExecute(game) ?? game;
    }

    if (node.content.type === 'installation') {
      game = appendMessage(game, {
        type: 'output',
        value: `(${game.hovered}) Server content executed - ${node.content.id}`,
      });
      game = node.content.onExecute(game) ?? game;
    }

    return {
      ...game,
    };
  },
  config: (game, args) => {
    const [key, value] = args._;

    if (!key) {
      return game;
    }

    if (!value) {
      return appendMessage(game, {
        type: 'output',
        value: `Config value for '${key}': ${game.player.config[key]}`
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

const executeCommand = (command: keyof typeof Commands, game: Game, args: CLIArgs, derived: GameDerived): Game => {
  return Commands[command](game, args, derived);
}

export const useCommands = ({
  game,
  setGame,
  gameDerived,
  levelController,
}: {
  game: Game,
  setGame: ReturnType<typeof useState<Game>>[1],
  gameDerived: GameDerived,
  levelController: LevelController,
}) => {
  const { hoveredNode, nodeMap } = gameDerived;
  // let game = rfdc(gameSource);

  // to fix: immutable

  const onCommand = useCallback((game: Game, command: Command, commandArgs: CLIArgs): Game => {
    if (command === 'next') {
      return executeCommand('next', game, commandArgs, gameDerived)
    }

    if (command === 'config') {
      return executeCommand('config', game, commandArgs, gameDerived)
    }

    if (game.player.actions <= 0) {
      return appendMessage(game, {
        type: 'output',
        value: `No actions left`
      });
    }

    if (command === 'retreat') {
      return executeCommand('retreat', game, commandArgs, gameDerived)
    }

    if (command === 'break') {
      return executeCommand('break', game, commandArgs, gameDerived)
    }

    if (command === 'drill') {
      return executeCommand('drill', game, commandArgs, gameDerived)
    }

    if (command === 'move') {
      return executeCommand('move', game, commandArgs, gameDerived)
    }

    if (command === 'nav') {
      return executeCommand('nav', game, commandArgs, gameDerived)
    }

    // if ice active, disable other commands
    if (hoveredNode?.ice && hoveredNode.ice.status === 'ACTIVE') {
      return appendMessage(game, {
        type: 'output',
        value: `ICE is active - cannot execute`
      });
    }

    if (command === 'execute') {
      return executeCommand('execute', game, commandArgs, gameDerived);
    }
  }, [game, gameDerived]);

  return useCallback((command: Command, ...rawArgs: string[]) => {
    if (game.mode === 'VIEW') {
      console.log('cannot issue commands in view mode');
      return;
    }

    let commandArgs = parseArgs(rawArgs);

    game = appendMessage(game, {
      type: 'command',
      value: `${command} ${rawArgs.join(' ')}`
    });

    if (levelController) {
      const controllerOutput = levelController.onCommand(game, command, commandArgs);
      if (controllerOutput) {
        if (controllerOutput.shouldContinue) {
          game = controllerOutput.game ?? game;
          command = controllerOutput.command ?? command;
          commandArgs = controllerOutput.args ?? commandArgs;
        } else {
          setGame(controllerOutput.game);
          return;
        }
      }
    }

    let newGame = onCommand(game, command, commandArgs);

    if (game.player.config.autonext && newGame.player.actions < 1) {
      newGame = onCommand(newGame, 'next', {_:[]} as CLIArgs);
    }

    if (newGame) {
      setGame(newGame)
    } else {
      setGame(game);
    }
  }, [game, gameDerived, onCommand, levelController])
}