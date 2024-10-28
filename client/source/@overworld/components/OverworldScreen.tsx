import * as React from 'react';
import { FlexCol } from '@client/components/FlexCol';
import { Button, Divider, Typography } from '@mui/material';
import { LevelsList } from '@overworld/components/LevelsList';
import { FlexRow } from '@client/components/FlexRow';
import { useOverworld } from '@overworld/hooks/use-overworld';
import { SimpleDialog } from '@client/components/SimpleDialog';
import { ConfirmDialog } from '@client/components/ConfirmDialog';
import { playerCapsule } from '@client/capsules/player';
import { FEEDBACK_URL } from '@client/constants/feedback';
import { transitionsCapsule } from '@client/capsules/transitions';
import { itemCountFormatted } from '@shared/utils/game/player';
import { Items } from '@shared/constants/items';

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
    playerCapsule.flush();
    transitionsCapsule.flush();
    window.location.reload();
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
        <Typography variant={'body1'}>Money: {itemCountFormatted(player, Items.Money.id)}</Typography>
        <Typography variant={'body1'}>XP: {player.xp}</Typography>
        <Typography variant={'body1'}>Actions per turn: {player.actions}</Typography>
        <Typography variant={'body1'}>RAM: {player.ram.max}</Typography>
        <Typography variant={'body1'} sx={{ ml: 1 }}>RAM/turn: {player.ram.recovery}</Typography>
        <Typography variant={'body1'}>Icebreaker:</Typography>
        <Typography variant={'body1'} sx={{ ml: 1}}>Barrier: {player.stats.icebreaker.barrier}</Typography>
        <Typography variant={'body1'} sx={{ ml: 1}}>Sentry: {player.stats.icebreaker.sentry}</Typography>
        <Typography variant={'body1'} sx={{ ml: 1}}>Codegate: {player.stats.icebreaker.codegate}</Typography>
        <Typography variant={'body1'}>Recon:</Typography>
        <Typography variant={'body1'} sx={{ ml: 1}}>Info: {player.stats.recon.info}</Typography>
      </FlexCol>
      <FlexCol>
        <Typography variant={'subtitle1'}>Actions</Typography>
        <Divider />
        <Button onClick={() => setShowConfirmReset(true)}>Reset Game</Button>
        <Button href={FEEDBACK_URL} target={'_blank'}>Give Feedback</Button>
        <Button href={'/play/inventory'}>Inventory</Button>
        <Button href={'/play/deck'}>Deck</Button>
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
      color={'error'}
    />
  </FlexCol>
}