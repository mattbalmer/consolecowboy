import { Command, CompassDir, Game, NodeID } from '@shared/types/game';
import { getDice } from '@shared/utils/game';
import { useMemo, useState } from 'react';
import { coordToString, getAdjacentCoords } from '@shared/utils/game/grid';
import { replace } from '@shared/utils/arrays';
import { pick } from '@shared/utils/objects';
import { GameDerived } from '@game/hooks/use-game';

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
  const validMoveCoords = useMemo(() => {
    return getAdjacentCoords(game);
  }, [game]);

  const move = (target: string, useDice: string, r: boolean = false) => {
    const targetNode = game.nodes[target.toUpperCase()];
    if (!target || !targetNode) {
      return;
    }
    const targetCoord = coordToString(targetNode);
    if (target && validMoveCoords.includes(targetCoord)) {
      const diceAvailableByNumber = game.player.dice.reduce((a, d) => {
        if (d.isAvailable) {
          return {
            ...a,
            [d.value]: a[d.value] + 1,
          };
        } else {
          return a;
        }
      }, { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 });

      if (Number.isInteger(Number(useDice)) && diceAvailableByNumber[useDice] > 0) {
        setGame((prev) => {
          prev.nodes[target].isVisited = true;

          const diceIndex = prev.player.dice.findIndex(d => d.value === Number(useDice));

          prev = {
            ...prev,
            player: {
              ...prev.player,
              actions: prev.player.actions - 1,
              dice: replace(prev.player.dice, diceIndex, [{
                value: Number(useDice),
                isAvailable: false,
              }]),
            },
            hovered: target,
            history: {
              nodes: [...prev.history.nodes, prev.hovered],
              terminal: [...prev.history.terminal, {
                type: 'command',
                value: r ? 'retreat' : `move ${target}`,
              }],
            },
          };

          if (prev.nodes[target].ice) {
            prev = prev.nodes[target].ice.activate(prev) ?? prev;
          }

          return prev;
        });
      } else {
        console.log(`cannot use dice ${useDice} to move to ${target} - dice is not available`);
      }

    } else {
      console.log('cannot move to', target);
    }
  }

  const nav = (dir: CompassDir, r: boolean = false) => {
    if (!dir) {
      return;
    }
    const current = pick(game.nodes[game.hovered], 'x', 'y');
    const targetCoord = coordToString({
      x: current.x + (dir.includes('e') ? 1 : dir.includes('w') ? -1 : 0),
      y: current.y + (dir.includes('s') ? 1 : dir.includes('n') ? -1 : 0),
    });
    const target = nodeMap[targetCoord];
    if (target && validMoveCoords.includes(targetCoord)) {
      setGame((prev) => {
        prev.nodes[target].isVisited = true;

        prev = {
          ...prev,
          player: {
            ...prev.player,
            actions: prev.player.actions - 1,
          },
          hovered: target,
          history: {
            nodes: [...prev.history.nodes, prev.hovered],
            terminal: [...prev.history.terminal, {
              type: 'command',
              value: r ? 'retreat' : `nav ${dir}`,
            }],
          },
        };

        if (prev.nodes[target].ice) {
          prev = prev.nodes[target].ice.activate(prev) ?? prev;
        }

        return prev;
      });
    } else {
      console.log('cannot nav via', dir);
    }
  }

  const onCommand = (command: Command, ...args: any[]) => {
    if (game.mode === 'VIEW') {
      console.log('cannot issue commands in view mode');
      return;
    }

    if (command === 'next') {
      setGame((prev) => {
        const newConditions = [];
        prev.player.conditions.forEach(c => {
          if (c.until === prev.round) {
            prev = c.onEnd(prev);
          } else {
            newConditions.push(c);
          }
        });
        prev.player.conditions = newConditions;
        return {
          ...prev,
          round: prev.round + 1,
          player: {
            ...prev.player,
            actions: prev.player.actionsPerTurn,
            dice: getDice(prev.player.actionsPerTurn),
          },
          history: {
            ...prev.history,
            terminal: [
              ...prev.history.terminal,
              {
                type: 'command',
                value: `next`,
              },
            ],
          },
        };
      });
    }

    if (game.player.actions <= 0) {
      console.log('no actions left');
      return;
    }

    if (command === 'retreat') {
      // const lastDir = history[history.length - 1].split(' ')[1] as CompassDir;
      // const flippedDir = lastDir.split('').map(c => {
      //   if (c === 'n') return 's';
      //   if (c === 's') return 'n';
      //   if (c === 'e') return 'w';
      //   if (c === 'w') return 'e';
      //   return c as CompassDir;
      // }).join('') as CompassDir;
      //
      // nav(flippedDir, true);
      const useDice = args[0].toUpperCase();
      move(game.history.nodes[game.history.nodes.length - 1], useDice, true);
    }

    if (command === 'break') {
      const layer = parseInt(args[0]);

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

      setGame((prev) => {
        prev = hoveredNode.ice.break(prev, layer);
        return {
          ...prev,
          player: {
            ...prev.player,
            actions: prev.player.actions - 1,
          },
          history: {
            ...prev.history,
            terminal: [
              ...prev.history.terminal,
              {
                type: 'command',
                value: `break (${game.hovered}) -l ${layer}`,
              },
            ],
          },
        };
      });
    }

    if (command === 'drill') {
      if (!hoveredNode.ice) {
        console.log('no ice to drill');
        return;
      }

      if (hoveredNode.ice.status !== 'ACTIVE') {
        console.log('ice is not active');
        return;
      }

      // complete all layers of ice
      setGame((prev) => {
        prev = hoveredNode.ice.complete(prev);
        return {
          ...prev,
          player: {
            ...prev.player,
            actions: prev.player.actions - 1,
          },
          history: {
            ...prev.history,
            terminal: [
              ...prev.history.terminal,
              {
                type: 'command',
                value: `drill (${game.hovered})`,
              },
            ],
          },
        };
      });
    }

    // if ice active, disable other commands
    if (hoveredNode?.ice && hoveredNode.ice.status === 'ACTIVE') {
      console.log('ice is active. cannot do other actions');
      return;
    }

    if (command === 'move') {
      const target = args[0].toUpperCase() as NodeID;
      const useDice = args[1].toUpperCase();
      move(target, useDice);
    }

    if (command === 'nav') {
      const dir = args[0].toLowerCase() as CompassDir;
      nav(dir);
    }

    if (command === 'open' && hoveredNode.content) {
      if (hoveredNode.content.status === 'OPENED' || hoveredNode.isOpened) {
        console.log('node already opened');
        return;
      }

      // or instead of auto, seeing the content is another progression system
      console.log('open the hovered node. trigger trap effects or capture effects. this should maybe be auto? dunno');
      setGame((prev) => {
        const node = prev.nodes[prev.hovered];

        // todo: no more 2 sources of truth
        node.isOpened = true;
        node.content.status = 'OPENED';

        if (node.content.type === 'trap') {
          prev = node.content.activate(prev) ?? prev;
        }

        if (node.content.type === 'installation') {
          prev = node.content.onCapture(prev) ?? prev;
        }

        return {
          ...prev,
          player: {
            ...prev.player,
            actions: prev.player.actions - 1,
          },
          history: {
            ...prev.history,
            terminal: [
              ...prev.history.terminal,
              {
                type: 'command',
                value: `open (${game.hovered})`,
              },
            ],
          },
        };
      });
    }
  }

  return onCommand;
}