import { Command, CompassDir, Game } from '@shared/types/game';
import { getDice } from '@shared/utils/game';
import { useMemo, useState } from 'react';
import { coordToString, getAdjacentCoords } from '@shared/utils/game/grid';
import { replace } from '@shared/utils/arrays';
import { pick } from '@shared/utils/objects';
import { GameDerived } from '@game/hooks/use-game';
import { CLIArgs } from '@shared/types/game/cli';
import { getDiceCounts } from '@shared/utils/game/dice';
import { parseArgs } from '@shared/utils/game/cli';

const Commands = {
  m: game => game,
  info: game => game,
  move: (game, args: CLIArgs<void, [target: string]>) => {
    const target = args._[0]?.toUpperCase();
    const dice = args.d?.[0];
    const validMoveCoords = getAdjacentCoords(game);
    const targetNode = game.nodes[target];

    if (!target || !targetNode) {
      return;
    }
    const targetCoord = coordToString(targetNode);

    if (!target || !validMoveCoords.includes(targetCoord)) {
      console.log('cannot move to', target);
      return game;
    }

    if (!dice) {
      console.log('No valid dice given');
      return game;
    }

    if (getDiceCounts(game.player.dice)[dice] < 1) {
      console.log(`No available dice of value ${dice}`);
      return game;
    }

    const diceIndex = game.player.dice.findIndex(d => d.value === dice && d.isAvailable);

    if (diceIndex < 0) {
      console.log('error allocating dice used', dice, diceIndex, game.player.dice);
      return game;
    }

    game.nodes[target].isVisited = true;

    game = {
      ...game,
      player: {
        ...game.player,
        actions: game.player.actions - 1,
        dice: replace(game.player.dice, diceIndex, [{
          value: dice,
          isAvailable: false,
        }]),
      },
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
    const dice = args.d?.[0];

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

    if (!dice) {
      console.log('No valid dice given');
      return game;
    }

    if (getDiceCounts(game.player.dice)[dice] < 1) {
      console.log(`No available dice of value ${dice}`);
      return game;
    }

    game.nodes[target].isVisited = true;

    game = {
      ...game,
      player: {
        ...game.player,
        actions: game.player.actions - 1,
      },
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
    const dice = args.d?.[0];
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

    if (!dice) {
      console.log('No valid dice given');
      return game;
    }

    if (getDiceCounts(game.player.dice)[dice] < 1) {
      console.log(`No available dice of value ${dice}`);
      return game;
    }

    game.nodes[target].isVisited = true;

    const diceIndex = game.player.dice.findIndex(d => d.value === dice && d.isAvailable);

    game = {
      ...game,
      player: {
        ...game.player,
        actions: game.player.actions - 1,
        dice: replace(game.player.dice, diceIndex, [{
          value: dice,
          isAvailable: false,
        }]),
      },
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

    game = hoveredNode.ice.break(game, layer);
    return {
      ...game,
      player: {
        ...game.player,
        actions: game.player.actions - 1,
      },
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

    // complete all layers of ice
    game = hoveredNode.ice.complete(game);
    return {
      ...game,
      player: {
        ...game.player,
        actions: game.player.actions - 1,
      },
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

    return {
      ...game,
      player: {
        ...game.player,
        actions: game.player.actions - 1,
      },
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

  const onCommand = (command: Command, ...rawArgs: string[]) => {
    if (game.mode === 'VIEW') {
      console.log('cannot issue commands in view mode');
      return;
    }

    const parsedArgs = parseArgs(rawArgs);

    if (command === 'next') {
      setGame((prev) => {
        return Commands.next(game);
      });
    }

    if (game.player.actions <= 0) {
      console.log('no actions left');
      return;
    }

    if (command === 'retreat') {
      setGame(prev => {
        // @ts-ignore
        return Commands.retreat(prev, parsedArgs, gameDerived);
      });
    }

    if (command === 'break') {
      setGame(prev => {
        // @ts-ignore
        return Commands.break(prev, parsedArgs, gameDerived);
      });
    }

    if (command === 'drill') {
      setGame(prev => {
        // @ts-ignore
        return Commands.drill(prev, parsedArgs, gameDerived);
      });
    }

    if (command === 'move') {
      setGame(prev => {
        // @ts-ignore
        return Commands.move(prev, parsedArgs);
      });
    }

    if (command === 'nav') {
      setGame(prev => {
        // @ts-ignore
        return Commands.nav(prev, parsedArgs, gameDerived);
      });
    }

    // if ice active, disable other commands
    if (hoveredNode?.ice && hoveredNode.ice.status === 'ACTIVE') {
      console.log('ice is active. cannot do other actions');
      return;
    }

    if (command === 'open') {
      setGame(prev => {
        // @ts-ignore
        return Commands.open(prev, parsedArgs, gameDerived);
      });
    }
  }

  return onCommand;
}