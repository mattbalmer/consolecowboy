import * as React from 'react';
import { FlexCol } from '@client/components/FlexCol';
import { FlexRow } from '@client/components/FlexRow';
import { useEffect, useMemo, useState } from 'react';
import { Command, CompassDir, CoordString, Dir, Game, NodeID, NodeMap } from '@game/types';
import { coordToString } from '@game/utils/grid';
import { Grid } from '@game/components/Grid';
import { Typography } from '@mui/material';
import { CommandLine } from '@game/components/CommandLine';
import { pick } from '@shared/utils/objects';
import { gameFromLevel, getDice, invertNodes } from '@game/utils/game';
import { Level } from '@shared/types/game/level';
import { GameEffects } from '@shared/constants/effects';
import { SimpleDialog } from '@client/components/SimpleDialog';
import { getControllerFor } from '@game/level-controllers';
import { playerCapsule } from '@client/capsules/player';
import { HUD } from '@game/components/HUD';
import { replace } from '@shared/utils/arrays';

const getAdjacentCoords = (game: Game): CoordString[] => {
  const allDirs: Dir[] = ['up', 'left', 'down', 'right'];
  const hoveredNode = game.nodes[game.hovered];

  const nodeMap = (() => {
    const keys = Object.keys(game.nodes);
    return Object.values(game.nodes).map(coordToString).reduce((m, coord, i) => {
      return {
        ...m,
        [coord]: keys[i],
      }
    }, {} as NodeMap);
  })();

  return allDirs
    .map(dir => {
      const x = dir === 'left' ? hoveredNode.x - 1 : dir === 'right' ? hoveredNode.x + 1 : hoveredNode.x;
      const y = dir === 'up' ? hoveredNode.y - 1 : dir === 'down' ? hoveredNode.y + 1 : hoveredNode.y;
      return coordToString({ x, y });
    })
    .filter(coord => coord in nodeMap);
}

const useGame = ({
  level,
  player,
}: {
  level: Level,
  player: Game['player'],
}) => {
  const [game, setGame] = useState<Game>(gameFromLevel(
    level,
    player,
  ));

  useEffect(() => {
    setGame(gameFromLevel(level, player));
  }, [level, player]);

  return {
    game,
    setGame,
  }
}

export const GameScreen = ({
  level,
  levelID,
  player,
  shouldBindController,
}: {
  level: Level,
  levelID: string,
  player: Game['player'],
  shouldBindController: boolean,
}) => {
  const { game, setGame } = useGame({
    level,
    player,
  });

  useEffect(() => {
    setGame((prev) => {
      const newGame = gameFromLevel(level, player);
      return {
        ...newGame,
        hovered: newGame.nodes[prev.hovered] ? prev.hovered : newGame.hovered,
      };
    });
  }, [level, player]);

  console.log('level', { ...level });
  console.log('game', { ...game });

  const [dialog, setDialog] = useState<{
    title: string,
    body: string,
    acknowledge: string,
    onFinish: () => void,
  }>(null);

  const levelController = useMemo(() => {
    return shouldBindController ? getControllerFor(levelID) : null;
  }, [shouldBindController, levelID]);

  const hoveredNodeXY = useMemo(() => coordToString(game.nodes[game.hovered]), [game.nodes, game.hovered]);
  const nodeMap = useMemo(() => invertNodes(game.nodes), [game.nodes, game.hovered]);
  const hoveredNode = game.nodes[nodeMap[hoveredNodeXY]];
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
      const diceAvailableByNumber = player.dice.reduce((a, d) => {
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
      move(game.history.nodes[game.history.nodes.length - 1], '', true);
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

  useEffect(() => {
    if (levelController) {
      setGame((prev) => {
        return levelController.onChange({
          game: prev,
        }).game;
      });
    }
  }, [game.stack, game.history.terminal]);

  useEffect(() => {
    const effect = game.stack[0];

    if (effect) {
      console.log('trigger effect!', effect.id, { ...effect, trigger: null });

      if (effect.id === 'delay') {
        setGame((prev) => {
          return {
            ...prev,
            mode: 'VIEW',
          };
        });
        setTimeout(() => {
          setGame((prev) => {
            return {
              ...prev,
              mode: 'PLAY',
              stack: prev.stack.slice(1),
            }
          });
        }, effect['amount']);
      } else if((effect as ReturnType<typeof GameEffects.SimpleDialog>).id === 'dialog.simple') {
        console.log('trigger dialog effect');
        const dialogSettings = {
          title: (effect as ReturnType<typeof GameEffects.SimpleDialog>).title,
          body: (effect as ReturnType<typeof GameEffects.SimpleDialog>).body,
          acknowledge: (effect as ReturnType<typeof GameEffects.SimpleDialog>).acknowledge,
        };
        setDialog({
          ...dialogSettings,
          onFinish: () => {
            console.log('onFinish dialog');
            setGame((prev) => {
              return {
                ...prev,
                stack: prev.stack.slice(1),
                history: {
                  ...prev.history,
                  terminal: [
                    ...prev.history.terminal,
                    {
                      type: 'hidden',
                      value: `dialog: ${effect.id} | ${dialogSettings.title} | ${dialogSettings.body}`,
                    },
                  ],
                },
              };
            });
            setDialog(null);
          },
        });
      } else {
        setGame((prev) => {
          prev.stack = prev.stack.slice(1);
          return {
            ...prev,
            ...effect.trigger(prev),
          }
        });
      }
      if (effect.id === 'finish.extraction') {
        const savedPlayer = playerCapsule.get('player');
        const previousHistoryForLevel = savedPlayer.history[levelID] ?? [0, 0];
        playerCapsule.set('player', {
          ...savedPlayer,
          mental: game.player.mental,
          money: game.player.money,
          history: {
            ...savedPlayer.history,
            [levelID]: [
              previousHistoryForLevel[0],
              previousHistoryForLevel[1] + 1,
            ],
          },
        });

        setDialog({
          title: 'Extraction Complete',
          body: 'You have successfully connected to the external server, go back to the overworld.',
          acknowledge: 'Okay',
          onFinish: () => {
            window.location.href = '/play';
            setDialog(null);
          },
        });
      }
    }

  }, [game.stack]);

  console.log('render dialog', dialog);

  return <>
    <FlexCol data-game sx={{ flexGrow: 1 }}>
      <HUD
        game={game}
        hoveredNode={hoveredNode}
      />
      <FlexCol sx={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center' }}>
        <FlexRow sx={{ alignItems: 'center', position: 'relative' }}>
          <Grid
            size={[-2, 2]}
            hoveredNodeXY={hoveredNodeXY}
            nodeMap={nodeMap}
            game={game}
          />
          {hoveredNode.ice && hoveredNode.ice.status === 'ACTIVE' &&
            <FlexCol
              sx={{
                position: 'absolute',
                background: '#333333ee',
                borderRadius: 8,
                top: 20,
                left: '50%',
                transform: 'translateX(-50%)',
                boxShadow: '0 0 10px 2px #fff',
                p: 2,
              }}
            >
              <Typography variant={'h6'}>ICE is active!</Typography>
              <Typography variant={'body1'}>Layers:</Typography>
              <ul>
                {hoveredNode.ice.layers.map((layer, i) => {
                  return <li key={i}>
                    ({i}) - {layer.status}
                    {layer.effects.map((effect, j) => {
                      return <Typography key={j} variant={'body2'}>- {effect.id}</Typography>
                    })}
                  </li>
                })}
              </ul>
            </FlexCol>
          }
        </FlexRow>
      </FlexCol>
      <FlexRow sx={{ p: 2 }}>
        <CommandLine
          onCommand={onCommand}
          game={game}
        />
      </FlexRow>
      <SimpleDialog
        id={'game-effect-dialog'}
        isOpen={!!dialog}
        title={dialog?.title}
        body={dialog?.body}
        acknowledge={dialog?.acknowledge}
        onClose={dialog?.onFinish}
      />
    </FlexCol>
  </>
}