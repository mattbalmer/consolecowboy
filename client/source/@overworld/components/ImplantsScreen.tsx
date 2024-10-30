import * as React from 'react';
import { useMemo } from 'react';
import { FlexCol } from '@client/components/FlexCol';
import { Box, Button, Divider, Typography } from '@mui/material';
import { useOverworld } from '@overworld/hooks/use-overworld';
import { SimpleDialog } from '@client/components/SimpleDialog';
import { FlexRow } from '@client/components/FlexRow';
import { ImplantsManager } from '@overworld/components/ImplantsManager';
import { Implants } from '@shared/constants/implants';

export const ImplantsScreen = ({
}: {
}) => {
  const {
    player, setPlayer,
    dialog, setDialog,
  } = useOverworld('implants');

  const implants = useMemo(() =>
    player.implants.map(implant => Implants[implant]?.()),
    [player.implants]
  );

  return <FlexCol sx={{ flexGrow: 1, p: 2 }}>
    <Typography variant={'h5'} sx={{ mb: 2 }}>Overworld &gt; Implants</Typography>
    <FlexRow sx={{ mb: 2 }}>
      <FlexCol sx={{ flexGrow: 0 }}>
        <Typography variant={'subtitle1'}>Actions</Typography>
        <Divider />
        <Button href={`/play/zone/${player.lastZone}`}>Back to Overworld</Button>
      </FlexCol>
    </FlexRow>
    <Box>
      <ImplantsManager implants={implants} />
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