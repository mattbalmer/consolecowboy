import * as React from 'react';
import { FlexCol } from '@client/components/FlexCol';
import { NavBar } from '@client/components/NavBar';
import { Typography } from '@mui/material';
import { ImplantsScreen } from '@overworld/components/ImplantsScreen';

export const ImplantsPage = () => {
  return <FlexCol sx={{ flexGrow: 1, height: '100vh', background: '#111' }}>
    <NavBar />
    {true ?
      <ImplantsScreen />
      : <>
        <Typography>...Loading</Typography>
      </>
    }
  </FlexCol>
}