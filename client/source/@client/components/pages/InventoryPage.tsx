import * as React from 'react';
import { FlexCol } from '@client/components/FlexCol';
import { NavBar } from '@client/components/NavBar';
import { Typography } from '@mui/material';
import { InventoryScreen } from '@overworld/components/InventoryScreen';

export const InventoryPage = () => {
  return <FlexCol sx={{ flexGrow: 1, height: '100vh', background: '#111' }}>
    <NavBar />
    {true ?
      <InventoryScreen/>
      : <>
        <Typography>...Loading</Typography>
      </>
    }
  </FlexCol>
}