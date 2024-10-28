import * as React from 'react';
import { FlexCol } from '@client/components/FlexCol';
import { Box, Button, Divider, Typography } from '@mui/material';
import { useOverworld } from '@overworld/hooks/use-overworld';
import { SimpleDialog } from '@client/components/SimpleDialog';
import { InventoryManager } from '@overworld/components/InventoryManager';
import { FlexRow } from '@client/components/FlexRow';
import { Inventory, Player } from '@shared/types/game';
import { DeckManager } from '@overworld/components/DeckManager';
import { useMemo } from 'react';
import { CORE_COMMANDS } from '@shared/constants/commands';

const sizeToDisplay = (deck: Player['deck']): number => {
  const PER_ROW = 10;
  return (Math.ceil(deck.length / PER_ROW) + 1) * PER_ROW;
}

export const DeckScreen = ({
}: {
}) => {
  const {
    player, setPlayer,
    dialog, setDialog,
  } = useOverworld();

  const deck = useMemo<Player['deck']>(() => [
    ...player.deck,
    ...(CORE_COMMANDS.map(c => `command:${c}`) as Player['deck'])
  ], [player.deck]);

  return <FlexCol sx={{ flexGrow: 1, p: 2 }}>
    <Typography variant={'h5'} sx={{ mb: 2 }}>Overworld &gt; Inventory</Typography>
    <FlexRow sx={{ mb: 2 }}>
      <FlexCol sx={{ flexGrow: 0 }}>
        <Typography variant={'subtitle1'}>Actions</Typography>
        <Divider />
        <Button href={'/play'}>Back to Overworld</Button>
      </FlexCol>
    </FlexRow>
    <Box>
      <DeckManager
        deck={deck}
        size={sizeToDisplay(deck)}
      />
    </Box>
    <SimpleDialog
      id={'deck-dialog'}
      isOpen={!!dialog}
      title={dialog?.title}
      body={dialog?.body}
      acknowledge={dialog?.acknowledge}
      onClose={dialog?.onFinish}
    />
  </FlexCol>
}