import * as React from 'react';
import { FlexCol } from '@client/components/FlexCol';
import { FlexRow } from '@client/components/FlexRow';
import { useEffect, useMemo, useState } from 'react';
import { Command, CompassDir, Coord, CoordString, Dir, Game, NodeID, NodeMap } from '@game/types';
import { coordToString } from '@game/utils/grid';
import { Grid } from '@game/components/Grid';
import { Typography } from '@mui/material';
import { CommandLine } from '@game/components/CommandLine';
import { ICE } from '@game/constants/ice';
import { Installations } from '@game/constants/installations';
import { Traps } from '@game/constants/traps';
import { pick } from '@shared/utils/objects';

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

const useGame = () => {
  const [game, setGame] = useState<Game>({
    nodes: {
      'A': { x: -1, y: -1, isVisited: true, },
      'B': { x: -1, y: 0, ice: ICE.NeuralKatana(), content: { type: 'installation', status: 'STANDBY' , ...Installations.Wallet({ amount: 100 }) } },
      'C': { x: 0, y: -1 },
      'D': { x: 0, y: 0, ice: ICE.NeuralKatana(), content: { type: 'trap', status: 'STANDBY', ...Traps.RabbitHole({
        amount: 1,
        duration: 2,
      }) } },
      'E': { x: 1, y: -1 },
    },
    edges: {
      'A:B': 'bi',
      'A:C': 'bi',
      'B:D': 'bi',
      'C:D': 'bi',
      'C:E': 'bi',
    },
    hovered: 'A',
    player: {
      mental: 10,
      ram: {
        max: 3,
        current: 3,
      },
      money: 0,
      actions: 2,
      stats: {
        icebreaker: 1,
      },
      conditions: [],
    },
    stack: [],
    round: 0,
    mode: 'PLAY',
  });

  return {
    game,
    setGame,
  }
}

export const GameScreen = () => {
  const { game, setGame } = useGame();
  const [history, setHistory] = useState<string[]>([]);

  console.log('game', { ...game });

  const hoveredNodeXY = useMemo(() => coordToString(game.nodes[game.hovered]), [game.nodes, game.hovered]);
  const nodeMap = useMemo(() => {
    const keys = Object.keys(game.nodes);
    return Object.values(game.nodes).map(coordToString).reduce((m, coord, i) => {
      return {
        ...m,
        [coord]: keys[i],
      }
    }, {} as NodeMap);
  }, [game.nodes, game.hovered]);
  const hoveredNode = game.nodes[nodeMap[hoveredNodeXY]];
  const validMoveCoords = useMemo(() => {
    return getAdjacentCoords(game);
  }, [game]);

  const move = (target: string, r: boolean = false) => {
    const targetNode = game.nodes[target.toUpperCase()];
    if (!target || !targetNode) {
      return;
    }
    const targetCoord = coordToString(targetNode);
    if (target && validMoveCoords.includes(targetCoord)) {
      setHistory((prev) => [...prev, r ? 'retreat' : `move ${target}`]);
      setGame((prev) => {
        prev.nodes[target].isVisited = true;

        if (prev.nodes[target].ice) {
          prev = prev.nodes[target].ice.activate(prev) ?? prev;
        }

        return {
          ...prev,
          player: {
            ...prev.player,
            actions: prev.player.actions - 1,
          },
          hovered: target,
        }
      });
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
      setHistory((prev) => [...prev, r ? 'retreat' : `nav ${dir}`]);
      setGame((prev) => {
        prev.nodes[target].isVisited = true;

        if (prev.nodes[target].ice) {
          prev = prev.nodes[target].ice.activate(prev) ?? prev;
        }

        return {
          ...prev,
          player: {
            ...prev.player,
            actions: prev.player.actions - 1,
          },
          hovered: target,
        }
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
      setHistory((prev) => [...prev, 'next']);
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
            actions: 2,
          },
        };
      });
    }

    if (game.player.actions <= 0) {
      console.log('no actions left');
      return;
    }

    if (command === 'retreat') {
      const lastDir = history[history.length - 1].split(' ')[1] as CompassDir;
      const flippedDir = lastDir.split('').map(c => {
        if (c === 'n') return 's';
        if (c === 's') return 'n';
        if (c === 'e') return 'w';
        if (c === 'w') return 'e';
        return c as CompassDir;
      }).join('') as CompassDir;

      nav(flippedDir, true);
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

      setHistory((prev) => [...prev, `break (${game.hovered}) -l ${layer}`]);
      setGame((prev) => {
        prev = hoveredNode.ice.break(prev, layer);
        return {
          ...prev,
          player: {
            ...prev.player,
            actions: prev.player.actions - 1,
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
      setHistory((prev) => [...prev, `drill (${game.hovered})`]);
      setGame((prev) => {
        prev = hoveredNode.ice.complete(prev);
        return {
          ...prev,
          player: {
            ...prev.player,
            actions: prev.player.actions - 1,
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
      move(target);
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
      setHistory((prev) => [...prev, `open (${game.hovered})`]);
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
        };
      });
    }
  }

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
      } else {
        setGame((prev) => {
          prev.stack = prev.stack.slice(1);
          return {
            ...prev,
            ...effect.trigger(prev),
          }
        });
      }
    }
  }, [game.stack]);

  return <div>
    <FlexCol
      sx={{ flexGrow: 1, height: '100vh', background: '#111' }}
    >
      <FlexRow sx={{ p: 2, justifyContent: 'space-between' }}>
        <FlexCol>
          <FlexRow sx={{ alignItems: 'center' }}>
            <Typography variant={'h6'} sx={{ mr: 1 }}>{game.hovered}</Typography>
            <Typography variant={'subtitle1'}>({hoveredNode.x}, {hoveredNode.y})</Typography>
          </FlexRow>
          <FlexRow sx={{ alignItems: 'center' }}>
            <Typography variant={'subtitle1'}>ICE: {hoveredNode.ice ?
              <>{hoveredNode.ice.id} ({hoveredNode.ice.status.toLowerCase()})</>
            : '--'}</Typography>
          </FlexRow>
          <FlexRow sx={{ alignItems: 'center' }}>
            <Typography variant={'subtitle1'}>Content: {hoveredNode.content ?
              <>{hoveredNode.content.type} ({hoveredNode.content.status.toLowerCase()})</>
            : '--'}</Typography>
          </FlexRow>
        </FlexCol>
        <FlexCol>
          <FlexRow sx={{ alignItems: 'center' }}>
            <Typography variant={'h6'}>Round: {game.round}</Typography>
          </FlexRow>
          <FlexRow sx={{ alignItems: 'center' }}>
            <Typography variant={'subtitle1'}>Actions: {game.player.actions}</Typography>
          </FlexRow>
          <FlexRow sx={{ alignItems: 'center' }}>
            <Typography variant={'subtitle1'}>Mental: {game.player.mental}</Typography>
          </FlexRow>
          <FlexRow sx={{ alignItems: 'center' }}>
            <Typography variant={'subtitle1'} sx={{ ml: 2 }}>RAM: {game.player.ram.current} / {game.player.ram.max}</Typography>
          </FlexRow>
          <FlexRow sx={{ alignItems: 'center' }}>
            <Typography variant={'subtitle1'} sx={{ ml: 2 }}>Money: {game.player.money}</Typography>
          </FlexRow>
          <FlexRow sx={{ alignItems: 'center' }}>
            <Typography variant={'subtitle1'} sx={{ ml: 2 }}>ICEBreaker Power: {game.player.stats.icebreaker}</Typography>
          </FlexRow>
        </FlexCol>
      </FlexRow>
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
          history={history}
          game={game}
        />
      </FlexRow>
    </FlexCol>
  </div>
}