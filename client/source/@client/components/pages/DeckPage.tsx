import * as React from 'react';
import { FlexCol } from '@client/components/FlexCol';
import { NavBar } from '@client/components/NavBar';
import { Typography } from '@mui/material';
import { DeckScreen } from '@overworld/components/DeckScreen';

export const DeckPage = () => {
  return <FlexCol sx={{ flexGrow: 1, height: '100vh', background: '#111' }}>
    <NavBar />
    {true ?
      <DeckScreen/>
      : <>
        <Typography>...Loading</Typography>
      </>
    }
  </FlexCol>
}