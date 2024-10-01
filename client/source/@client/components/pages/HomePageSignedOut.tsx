import * as React from 'react';
import { MainWithNav } from '@client/components/MainWithNav';
import { FlexCol } from '@client/components/FlexCol';
import { Typography } from '@mui/material';

export const HomePageSignedOut = () => {
  return <MainWithNav
    selected={'playbooks'}
  >
    <FlexCol
      sx={{
        flexGrow: 1,
      }}
    >
      <Typography>Please log in to play</Typography>
    </FlexCol>
  </MainWithNav>
}