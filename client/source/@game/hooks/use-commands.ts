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
  info: game => game,
  move: (game, args: CLIArgs<void, [target: string]>) => {
    const target = args._[0]?.toUpperCase();
    const validMoveCoords = getAdjacentCoords(game);
    const targetNode = game.nodes[target];

    if (!target || !targetNode) {
      return game;
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
        nodes: [...game.history.nodes, game.hovered],
        terminal: [...game.history.terminal, {
          type: 'command',
          value: `move ${target}`,
        }],
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
        nodes: [...game.history.nodes, game.hovered],
        terminal: [...game.history.terminal, {
          type: 'command',
          value: `nav ${dir}`,
        }],
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
        nodes: [...game.history.nodes, game.hovered],
        terminal: [...game.history.terminal, {
          type: 'command',
          value: `retreat ${target}`,
        }],
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
      history: {
        ...game.history,
        terminal: [
          ...game.history.terminal,
          {
            type: 'command',
            value: `next`,
          },
        ],
      },
    };
  },
  break: (game, args: CLIArgs<{ l: string }>, { hoveredNode }) => {
    const layer = parseInt(args.l);

    if (!hoveredNode.ice) {
      console.log('no ice to break');
      return;
    }

    if (isNaN(layer) || layer < 0 || layer >= hoveredNode.ice.layers.length) {
      console.log(`invalid layer ${layer} to break`);
      return;
    }

    if (hoveredNode.ice.layers[layer].status !== 'ACTIVE') {
      console.log(`layer ${layer} is not active`);
      return;
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
    return {
      ...game,
      history: {
        ...game.history,
        terminal: [
          ...game.history.terminal,
          {
            type: 'command',
            value: `break (${game.hovered}) -l ${layer}`,
          },
        ],
      },
    };
  },
  drill: (game, args, { hoveredNode }) => {
    if (!hoveredNode.ice) {
      console.log('no ice to drill');
      return game;
    }

    if (hoveredNode.ice.status !== 'ACTIVE') {
      console.log('ice is not active');
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

    // complete all layers of ice
    game = hoveredNode.ice.complete(game);
    return {
      ...game,
      history: {
        ...game.history,
        terminal: [
          ...game.history.terminal,
          {
            type: 'command',
            value: `drill (${game.hovered})`,
          },
        ],
      },
    };
  },
  open: (game, args, { hoveredNode }) => {
    if (!hoveredNode.content) {
      console.log('node has nothing to open');
      return game;
    }
    if (hoveredNode.content.status === 'OPENED' || hoveredNode.isOpened) {
      console.log('node already opened');
      return game;
    }

    // or instead of auto, seeing the content is another progression system
    console.log('open the hovered node. trigger trap effects or capture effects. this should maybe be auto? dunno');
    const node = game.nodes[game.hovered];

    // todo: no more 2 sources of truth
    node.isOpened = true;
    node.content.status = 'OPENED';

    if (node.content.type === 'trap') {
      game = node.content.activate(game) ?? game;
    }

    if (node.content.type === 'installation') {
      game = node.content.onCapture(game) ?? game;
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
      history: {
        ...game.history,
        terminal: [
          ...game.history.terminal,
          {
            type: 'command',
            value: `open (${game.hovered})`,
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
}: {
  game: Game,
  setGame: ReturnType<typeof useState<Game>>[1],
  gameDerived: GameDerived,
}) => {
  const { hoveredNode, nodeMap } = gameDerived;
  // let game = rfdc(gameSource);

  // to fix: immutable

  const onCommand = useCallback((game: Game, command: Command, commandArgs: CLIArgs): Game => {
    if (command === 'next') {
      return executeCommand('next', game, commandArgs, gameDerived)
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
        value: `ICE is active - cannot open`
      });
    }

    if (command === 'open') {
      return executeCommand('open', game, commandArgs, gameDerived);
    }
  }, [game, gameDerived]);

  return useCallback((command: Command, ...rawArgs: string[]) => {
    if (game.mode === 'VIEW') {
      console.log('cannot issue commands in view mode');
      return;
    }

    game = appendMessage(game, {
      type: 'command',
      value: `${command} ${rawArgs.join(' ')}`
    });

    const commandArgs = parseArgs(rawArgs);

    const newGame = onCommand(game, command, commandArgs);

    if (newGame) {
      setGame(newGame)
    } else {
      setGame(game);
    }
  }, [game, gameDerived, onCommand])
}