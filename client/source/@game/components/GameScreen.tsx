import * as React from 'react';
import { FlexCol } from '@client/components/FlexCol';
import { FlexRow } from '@client/components/FlexRow';
import { useMemo, useState } from 'react';
import { Command, CoordString, Dir, Game, NodeMap } from '@game/types';
import { coordToString } from '@game/utils/grid';
import { Grid } from '@game/components/Grid';
import { Typography } from '@mui/material';
import { CommandLine } from '@game/components/CommandLine';
import { ICE } from '@game/constants/ice';
import { Installations } from '@game/constants/installations';
import { Traps } from '@game/constants/traps';

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
      'B': { x: 0, y: 1, ice: ICE.NeuralKatana, content: { type: 'installation', ...Installations.Wallet } },
      'C': { x: 1, y: 0 },
      'D': { x: 1, y: 1, ice: ICE.NeuralKatana, content: { type: 'trap', ...Traps.RabbitHole } },
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
  });

  return {
    game,
    setGame,
  }
}


export const GameScreen = () => {
  const { game, setGame } = useGame();
  const [history, setHistory] = useState<string[]>([]);

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

  const handleKeyDown = (e: KeyboardEvent) => {
    if (document.activeElement !== document.body) {
      return;
    }

    if (e.key === 'ArrowUp') {
      setGame((prev) => {
        const hovered = prev.hovered;
        const node = prev.nodes[hovered];
        const y = node.y - 1;
        const coordStr = coordToString({ x: node.x, y });
        prev.nodes[nodeMap[coordStr]].isVisited = true;
        if (coordStr in nodeMap) {
          return {
            ...prev,
            hovered: nodeMap[coordStr],
          }
        }
        return prev;
      });
    }
    if (e.key === 'ArrowDown') {
      setGame((prev) => {
        const hovered = prev.hovered;
        const node = prev.nodes[hovered];
        const y = node.y + 1;
        const coordStr = coordToString({ x: node.x, y });
        prev.nodes[nodeMap[coordStr]].isVisited = true;
        if (coordStr in nodeMap) {
          return {
            ...prev,
            hovered: nodeMap[coordStr],
          }
        }
        return prev;
      });
    }
    if (e.key === 'ArrowLeft') {
      setGame((prev) => {
        const hovered = prev.hovered;
        const node = prev.nodes[hovered];
        const x = node.x - 1;
        const coordStr = coordToString({ x, y: node.y });
        prev.nodes[nodeMap[coordStr]].isVisited = true;
        if (coordStr in nodeMap) {
          return {
            ...prev,
            hovered: nodeMap[coordStr],
          }
        }
        return prev;
      });
    }
    if (e.key === 'ArrowRight') {
      setGame((prev) => {
        const hovered = prev.hovered;
        const node = prev.nodes[hovered];
        const x = node.x + 1;
        const coordStr = coordToString({ x, y: node.y });
        prev.nodes[nodeMap[coordStr]].isVisited = true;
        if (coordStr in nodeMap) {
          return {
            ...prev,
            hovered: nodeMap[coordStr],
          }
        }
        return prev;
      });
    }
  }

  const onCommand = (command: Command, ...args: any[]) => {
    if (command === 'move') {
      const target = args[0].toUpperCase() as string;
      if (!target) {
        return;
      }
      if (!game.nodes[target]) {
        return;
      }
      const targetCoord = coordToString(game.nodes[target]);
      if (validMoveCoords.includes(targetCoord)) {
        setHistory((prev) => [...prev, `move ${args.join(' ')}`]);
        setGame((prev) => {
          return {
            ...prev,
            hovered: target,
          }
        });
      } else {
        console.log('cannot move to', target);
      }
    }

    if (command === 'open' && hoveredNode.content) {
      // or instead of auto, seeing the content is another progression system
      console.log('open the hovered node. trigger trap effects or capture effects. this should maybe be auto? dunno');
    }
  }

  // Assign key down
  // useEffect(() => {
  //   document.addEventListener('keydown', handleKeyDown);
  //   document.body.focus();
  //
  //   return () => {
  //     document.removeEventListener('keydown', handleKeyDown);
  //   }
  // }, []);

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
            <Typography variant={'h6'}>ICE: {hoveredNode.ice ? hoveredNode.ice.id : 'n/a'}</Typography>
          </FlexRow>
          <FlexRow sx={{ alignItems: 'center' }}>
            <Typography variant={'h6'}>Content: {hoveredNode.content ? hoveredNode.content.type : 'n/a'}</Typography>
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
        <FlexRow sx={{ alignItems: 'center' }}>
          <Grid
            size={[-2, 2]}
            hoveredNodeXY={hoveredNodeXY}
            nodeMap={nodeMap}
          />
        </FlexRow>
      </FlexCol>
      <FlexRow sx={{ p: 2 }}>
        <CommandLine onCommand={onCommand} history={history} />
      </FlexRow>
    </FlexCol>
  </div>
}