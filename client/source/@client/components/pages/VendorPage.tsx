import * as React from 'react';
import { FlexCol } from '@client/components/FlexCol';
import { NavBar } from '@client/components/NavBar';
import { Typography } from '@mui/material';
import { vendorsCapsule } from '@client/capsules/vendors';
import { useParams } from 'react-router-dom';
import { Vendors } from '@shared/constants/vendors';
import { TradeScreen } from '@overworld/components/TradeScreen';

export const VendorPage = () => {
  let { id } = useParams();
  const vendor = vendorsCapsule.get(id as keyof typeof Vendors);

  return <FlexCol sx={{ flexGrow: 1, height: '100vh', background: '#111' }}>
    <NavBar />
    {vendor ?
      <TradeScreen vendor={vendor} />
      : <>
        <Typography>...Loading</Typography>
      </>
    }
  </FlexCol>
}