import * as React from 'react';
import { ComponentProps, useEffect, useState } from 'react';
import { FlexCol } from '@client/components/FlexCol';
import { FlexRow } from '@client/components/FlexRow';
import { Game } from '@matrix/types';
import { Grid } from '@matrix/components/Grid';
import { Typography } from '@mui/material';
import { CommandLine } from '@matrix/components/CommandLine';
import { Level } from '@shared/types/game/level';
import { SimpleDialog } from '@client/components/SimpleDialog';
import { playerCapsule } from '@client/capsules/player';
import { HUD } from '@matrix/components/HUD';
import { useGame } from '@matrix/hooks/use-game';
import { useGameEffects } from '@matrix/hooks/use-game-effects';
import { transitionsCapsule } from '@client/capsules/transitions';
import { gamePlayerToSavedPlayer } from '@shared/utils/game/player';
import { appendMessages } from '@shared/utils/game/cli';

const savePlayer = (levelID: string, game: Game, options?: {
  unlock?: (string | number)[],
}) => {
  const savedPlayer = playerCapsule.get('player');
  const player = gamePlayerToSavedPlayer(savedPlayer, game.player);

  const previousHistoryForLevel = player.history[levelID];

  if (previousHistoryForLevel[1] > 0) {
    return;
  }

  const history = {
    ...player.history,
    ...(options?.unlock ? options.unlock.reduce((acc, levelID) => {
      acc[levelID] = [0, 0];
      return acc;
    }, {}) : undefined),
    [levelID]: [
      previousHistoryForLevel[0],
      previousHistoryForLevel[1] + 1,
    ],
  };

  playerCapsule.set('player', {
    ...player,
    history,
  });
}

export const GameScreen = ({
  level,
  levelID,
  player,
  shouldBindController,
  bindKeyboardShortcuts,
}: {
  level: Level,
  levelID: string,
  player: Game['player'],
  shouldBindController: boolean,
  bindKeyboardShortcuts?: boolean,
}) => {
  const [dialog, setDialog] = useState<
    Omit<ComponentProps<typeof SimpleDialog>, 'id'>
  >(null);
  const {
    game,
    setGame,
    gameDerived,
    onCommand,
  } = useGame({
    level,
    player,
    shouldBindController,
    levelID,
  });
  const { hoveredNode, nodeMap } = gameDerived;

  useGameEffects({
    game,
    setGame,
    setDialog,
    onExtract: (success: boolean) => {
      if (success) {
        savePlayer(levelID, game, {
          unlock: [Number(levelID) + 1],
        });
        transitionsCapsule.set('extraction', {
          levelID,
          success: true,
          game,
        });
      } else {
        const savedPlayer = playerCapsule.get('player');
        savedPlayer.bodyHP -= 1; // todo: this is triggering twice for some reason
        savedPlayer.mental = 10;
        playerCapsule.set('player', savedPlayer);

        transitionsCapsule.set('extraction', {
          levelID,
          success: false,
          game,
        });
      }
    },
  });

  useEffect(() => {
    const previousHistoryForLevel = playerCapsule.get('player').history[levelID];
    // const hasShownReplayDialog = transitionsCapsule.get('hasShownReplayDialog');
    if (previousHistoryForLevel[1] > 0) {
      setGame(appendMessages(game, [{
        type: 'command',
        value: `replay`,
      }, {
        type: 'output',
        value: `You can replay levels, but wont gain anything for doing so. Enjoy the puzzles, but rewards come from future levels!`,
      }]));
    }
  }, []);

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
            offset={level.offset}
            game={game}
            derived={gameDerived}
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
              <Typography variant={'body1'}>{hoveredNode.ice.id} | Lvl{hoveredNode.ice.strength} {hoveredNode.ice.types.join(', ')}</Typography>
              <Typography variant={'body1'}>Layers:</Typography>
              <ul>
                {hoveredNode.ice.layers.map((layer, i) => {
                  return <li key={i}>
                    <Typography variant={'body2'}>({i}) - {layer.status}</Typography>
                    {(Array.isArray(layer.description) ? layer.description : [layer.description]).map((desc, i) => {
                      return <Typography key={i} variant={'body2'} sx={{ ml: 1 }}>- {desc}</Typography>
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
          bindArrowKeys={bindKeyboardShortcuts ?? true}
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