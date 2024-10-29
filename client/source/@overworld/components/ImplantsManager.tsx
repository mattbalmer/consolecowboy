import * as React from 'react';
import { Implant } from '@shared/types/game';
import { Box, Divider, Typography } from '@mui/material';
import { FlexCol } from '@client/components/FlexCol';
import { FlexRow } from '@client/components/FlexRow';

export const ImplantGridItem = ({ implant }: {
  implant: Implant,
}) => {
  return <FlexCol sx={{
    borderRadius: 5,
    border: `1px solid #ccc`,
    p: 1,
    justifyContent: 'space-between',
    width: 60,
    height: 60,
  }}>
    {implant ?
      <>
        <Typography variant={'body2'} sx={{ fontWeight: 'bold' }}>{implant.name}</Typography>
      </>
    : null}
  </FlexCol>
}

export const ImplantsManager = ({
  implants,
}: {
  implants: Implant[],
}) => {
  return <FlexCol>
    <Typography variant={'subtitle1'}>Implants</Typography>
    <Divider />
    <FlexRow sx={{ flexWrap: 'wrap' }}>
      {implants.map((implant, i) => {
        return <Box key={i} sx={{ m: 1 }}>
          <ImplantGridItem implant={implant} />
        </Box>
      })}
    </FlexRow>
  </FlexCol>
}