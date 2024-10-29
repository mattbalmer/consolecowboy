import * as React from 'react';
import { useMemo } from 'react';
import { FlexCol } from '@client/components/FlexCol';
import { Box, Button, Divider, Typography } from '@mui/material';
import { useOverworld } from '@overworld/hooks/use-overworld';
import { SimpleDialog } from '@client/components/SimpleDialog';
import { FlexRow } from '@client/components/FlexRow';
import { DeckManager } from '@overworld/components/DeckManager';
import { hydrateDeck } from '@shared/utils/game/decks';

export const DeckScreen = ({
}: {
}) => {
  const {
    player, setPlayer,
    dialog, setDialog,
  } = useOverworld('deck');

  const deck = useMemo(() => hydrateDeck(player.deck), [player.deck]);

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