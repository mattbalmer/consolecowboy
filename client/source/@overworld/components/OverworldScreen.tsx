import * as React from 'react';
import { FlexCol } from '@client/components/FlexCol';
import { Divider, Typography } from '@mui/material';
import { LevelsList } from '@overworld/components/LevelsList';
import { FlexRow } from '@client/components/FlexRow';
import { Player } from '@shared/types/game';

export const OverworldScreen = ({
  levels,
  player,
}: {
  levels: string[],
  player: Player,
}) => {
  return <FlexCol sx={{ flexGrow: 1, p: 2 }}>
    <Typography variant={'h5'} sx={{ mb: 2 }}>Overworld</Typography>
    <FlexRow>
      <FlexCol sx={{ pr: 4, mr: 4 }}>
        <Typography variant={'subtitle1'}>Levels</Typography>
        <Divider />
        <LevelsList
          levels={levels}
          history={player.history}
        />
      </FlexCol>
      <FlexCol>
        <Typography variant={'subtitle1'}>Player</Typography>
        <Divider sx={{ mb: 2 }} />
        <Typography variant={'body1'}>HP: {player.bodyHP}</Typography>
        <Typography variant={'body1'}>Mental HP: {player.mental}</Typography>
        <Typography variant={'body1'}>Money: {player.money}</Typography>
        <Typography variant={'body1'}>RAM: {player.ram}</Typography>
        <Typography variant={'body1'}>Icebreaker: {player.stats.icebreaker}</Typography>
      </FlexCol>
    </FlexRow>
  </FlexCol>
}