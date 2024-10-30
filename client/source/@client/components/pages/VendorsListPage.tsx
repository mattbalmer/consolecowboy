import * as React from 'react';
import { FlexCol } from '@client/components/FlexCol';
import { NavBar } from '@client/components/NavBar';
import { Box, Button, Divider, List, ListItemButton, ListItemText, Typography } from '@mui/material';
import { vendorsCapsule } from '@client/capsules/vendors';
import { FlexRow } from '@client/components/FlexRow';

export const VendorsListPage = () => {
  // @ts-ignore
  const vendors: string[] = Array.from(vendorsCapsule.keys);

  return <FlexCol sx={{ flexGrow: 1, height: '100vh', background: '#111' }}>
    <NavBar />
    {vendors ?
      <FlexCol sx={{ flexGrow: 1, p: 2 }}>
        <Typography variant={'h5'} sx={{ mb: 2 }}>Overworld &gt; Vendors</Typography>
        <FlexRow sx={{ mb: 2 }}>
          <FlexCol sx={{ flexGrow: 0 }}>
            <Typography variant={'subtitle1'}>Actions</Typography>
            <Divider />
            <Button href={'/play'}>Back to Overworld</Button>
          </FlexCol>
        </FlexRow>
        <Box>
          <List>
            {vendors.map(vendor => {
              return <ListItemButton key={vendor} component='a' href={`/play/vendor/${vendor}`}>
                <ListItemText primary={`${vendor}`} />
              </ListItemButton>
            })}
          </List>
        </Box>
      </FlexCol>
      : <>
        <Typography>...Loading</Typography>
      </>
    }
  </FlexCol>
}