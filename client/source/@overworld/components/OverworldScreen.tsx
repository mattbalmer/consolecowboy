import * as React from 'react';
import { FlexCol } from '@client/components/FlexCol';
import { Button, Divider, Typography } from '@mui/material';
import { LevelsList } from '@overworld/components/LevelsList';
import { FlexRow } from '@client/components/FlexRow';
import { useOverworld } from '@overworld/hooks/use-overworld';
import { SimpleDialog } from '@client/components/SimpleDialog';
import { ConfirmDialog } from '@client/components/ConfirmDialog';
import { getInitialPlayerProps } from '@client/capsules/player';

export const OverworldScreen = ({
  levels,
}: {
  levels: string[],
}) => {
  const [showConfirmReset, setShowConfirmReset] = React.useState<boolean>(false);
  const {
    player, setPlayer,
    dialog, setDialog,
  } = useOverworld();

  const handleReset = () => {
    setShowConfirmReset(false);
    setPlayer(getInitialPlayerProps());
  };

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
      <FlexCol sx={{ pr: 4, mr: 4 }}>
        <Typography variant={'subtitle1'}>Player</Typography>
        <Divider sx={{ mb: 2 }} />
        <Typography variant={'body1'}>HP: {player.bodyHP}</Typography>
        <Typography variant={'body1'}>Mental HP: {player.mental}</Typography>
        <Typography variant={'body1'}>Money: {player.money}</Typography>
        <Typography variant={'body1'}>RAM: {player.ram}</Typography>
        <Typography variant={'body1'}>Icebreaker: {player.stats.icebreaker}</Typography>
      </FlexCol>
      <FlexCol>
        <Typography variant={'subtitle1'}>Actions</Typography>
        <Divider />
        <Button onClick={() => setShowConfirmReset(true)}>Reset Game</Button>
      </FlexCol>
    </FlexRow>
    <SimpleDialog
      id={'overworld-dialog'}
      isOpen={!!dialog}
      title={dialog?.title}
      body={dialog?.body}
      acknowledge={dialog?.acknowledge}
      onClose={dialog?.onFinish}
    />
    <ConfirmDialog
      id={'overworld-confirm-dialog'}
      isOpen={showConfirmReset}
      title={'Reset Game'}
      body={'Are you sure you want to reset the game?'}
      onCancel={() => setShowConfirmReset(false)}
      onConfirm={handleReset}
      cancelText={'Cancel'}
      confirmText={'Reset'}
    />
  </FlexCol>
}