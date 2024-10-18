import * as React from 'react';
import { FlexCol } from '@client/components/FlexCol';
import { FlexRow } from '@client/components/FlexRow';
import { ComponentProps, useRef, useState } from 'react';
import { Game } from '@game/types';
import { Grid } from '@game/components/Grid';
import { Typography } from '@mui/material';
import { CommandLine } from '@game/components/CommandLine';
import { Level } from '@shared/types/game/level';
import { SimpleDialog } from '@client/components/SimpleDialog';
import { playerCapsule } from '@client/capsules/player';
import { HUD } from '@game/components/HUD';
import { useGame } from '@game/hooks/use-game';
import { useCommands } from '@game/hooks/use-commands';
import { useGameEffects } from '@game/hooks/use-game-effects';

const savePlayer = (levelID: string, game: Game) => {
  const savedPlayer = playerCapsule.get('player');
  const previousHistoryForLevel = savedPlayer.history[levelID] ?? [0, 0];
  const newPlayer = {
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
  };

  console.log('save newPlayer', newPlayer);

  playerCapsule.set('player', newPlayer);
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
  const [dialog, setDialog] = useState<
    Omit<ComponentProps<typeof SimpleDialog>, 'id'>
  >(null);
  const {
    game,
    setGame,
    gameDerived,
  } = useGame({
    level,
    player,
    shouldBindController,
    levelID,
  });
  const { hoveredNode, nodeMap } = gameDerived;

  const onCommand = useCommands({
    game,
    setGame,
    gameDerived
  });

  useGameEffects({
    game,
    setGame,
    setDialog,
    onExtract: () => {
      savePlayer(levelID, game);
    },
  });

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
            hoveredNode={hoveredNode}
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
        onClose={dialog?.onClose}
      />
    </FlexCol>
  </>
}