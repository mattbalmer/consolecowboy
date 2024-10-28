import * as React from 'react';
import { FlexCol } from '@client/components/FlexCol';
import { Box, Button, Divider, Typography } from '@mui/material';
import { useOverworld } from '@overworld/hooks/use-overworld';
import { SimpleDialog } from '@client/components/SimpleDialog';
import { InventoryManager } from '@overworld/components/InventoryManager';
import { FlexRow } from '@client/components/FlexRow';
import { Inventory } from '@shared/types/game';

const sizeToDisplay = (inventory: Inventory): number => {
  const PER_ROW = 10;
  return (Math.ceil(inventory.length / PER_ROW) + 1) * PER_ROW;
}

export const InventoryScreen = ({
}: {
}) => {
  const {
    player, setPlayer,
    dialog, setDialog,
  } = useOverworld();

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
      <InventoryManager
        inventory={player.inventory}
        size={sizeToDisplay(player.inventory)}
      />
    </Box>
    <SimpleDialog
      id={'inventory-dialog'}
      isOpen={!!dialog}
      title={dialog?.title}
      body={dialog?.body}
      acknowledge={dialog?.acknowledge}
      onClose={dialog?.onFinish}
    />
  </FlexCol>
}