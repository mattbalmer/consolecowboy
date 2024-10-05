import * as React from 'react';
import { FlexCol } from '@client/components/FlexCol';
import { FlexRow } from '@client/components/FlexRow';
import { useEffect, useMemo, useState } from 'react';
import { Command, CompassDir, Coord, CoordString, Dir, Game, NodeMap } from '@game/types';
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
      'A': { x: 0, y: 0, isVisited: true, },
      'B': { x: 0, y: 1, ice: ICE.NeuralKatana(), content: { type: 'installation', ...Installations.Wallet } },
      'C': { x: 1, y: 0 },
      'D': { x: 1, y: 1, ice: ICE.NeuralKatana(), content: { type: 'trap', ...Traps.RabbitHole } },
      'E': { x: 2, y: 0 },
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
      ram: 3,
      money: 0,
    },
    stack: [],
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

  const move = (dir: CompassDir, r: boolean = false) => {
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
      setHistory((prev) => [...prev, r ? 'retreat' : `move ${dir}`]);
      setGame((prev) => {
        prev.nodes[target].isVisited = true;

        if (prev.nodes[target].ice) {
          prev = prev.nodes[target].ice.activate(prev) ?? prev;
        }

        return {
          ...prev,
          hovered: target,
        }
      });
    } else {
      console.log('cannot move via', dir);
    }
  }

  const onCommand = (command: Command, ...args: any[]) => {
    if (command === 'retreat') {
      const lastDir = history[history.length - 1].split(' ')[1] as CompassDir;
      const flippedDir = lastDir.split('').map(c => {
        if (c === 'n') return 's';
        if (c === 's') return 'n';
        if (c === 'e') return 'w';
        if (c === 'w') return 'e';
        return c as CompassDir;
      }).join('') as CompassDir;

      move(flippedDir, true);
    }

    // if ice active, disable other commands
    if (hoveredNode?.ice && hoveredNode.ice.status === 'ACTIVE') {
      console.log('ice is active. cannot do other actions');
      return;
    }

    if (command === 'move') {
      const dir = args[0].toLowerCase() as CompassDir;
      move(dir);
    }

    if (command === 'open' && hoveredNode.content) {
      // or instead of auto, seeing the content is another progression system
      console.log('open the hovered node. trigger trap effects or capture effects. this should maybe be auto? dunno');
      setHistory((prev) => [...prev, `open (${game.hovered})`]);
      setGame((prev) => {
        prev.nodes[prev.hovered].isOpened = true;
        return prev;
      });
    }
  }

  useEffect(() => {
    const effect = game.stack[0];

    if (effect) {
      console.log('trigger effect!', effect.id, { ...effect, trigger: null });
      setGame((prev) => {
        prev.stack = prev.stack.slice(1);
        return {
          ...prev,
          ...effect.trigger(prev),
        };
      });
    }
  }, [game.stack]);

  return <div>
    <FlexCol
      sx={{ flexGrow: 1, height: '100vh', background: '#111' }}
    >
      <FlexRow sx={{ p: 2, justifyContent: 'space-between' }}>
        <FlexCol>
          <FlexRow sx={{ alignItems: 'center' }}>
            <Typography variant={'h4'} sx={{ mr: 1 }}>{game.hovered}</Typography>
            <Typography variant={'h6'}>({hoveredNode.x}, {hoveredNode.y})</Typography>
          </FlexRow>
          <FlexRow sx={{ alignItems: 'center' }}>
            <Typography variant={'h6'}>ICE: {hoveredNode.ice ?
              <>{hoveredNode.ice.id} ({hoveredNode.ice.status.toLowerCase()})</>
            : '--'}</Typography>
          </FlexRow>
          <FlexRow sx={{ alignItems: 'center' }}>
            <Typography variant={'h6'}>Content: {hoveredNode.content ? hoveredNode.content.type : '--'}</Typography>
          </FlexRow>
        </FlexCol>
        <FlexCol>
          <FlexRow sx={{ alignItems: 'center' }}>
            <Typography variant={'h6'}>Mental: {game.player.mental}</Typography>
          </FlexRow>
          <FlexRow sx={{ alignItems: 'center' }}>
            <Typography variant={'h6'} sx={{ ml: 2 }}>RAM: {game.player.ram}</Typography>
          </FlexRow>
          <FlexRow sx={{ alignItems: 'center' }}>
            <Typography variant={'h6'} sx={{ ml: 2 }}>Money: {game.player.money}</Typography>
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
              <Typography variant={'body1'}>Effects:</Typography>
              <ul>
                {hoveredNode.ice.effects.map((effects, i) => {
                  return <li key={i}>
                    {effects.map((effect, j) => {
                      return <Typography key={j} variant={'body2'}>{effect.id}</Typography>
                    })}
                  </li>
                })}
              </ul>
            </FlexCol>
          }
        </FlexRow>
      </FlexCol>
      <FlexRow sx={{ p: 2 }}>
        <CommandLine onCommand={onCommand} history={history} />
      </FlexRow>
    </FlexCol>
  </div>
}