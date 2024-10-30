import * as React from 'react';
import { List, ListItemButton, ListItemText } from '@mui/material';
import { Player } from '@shared/types/game';
import { VendorID } from '@shared/constants/vendors';

export const VendorsList = ({
  vendors,
}: {
  vendors: {
    id: VendorID,
    name: string,
    canVisit: boolean,
  }[],
}) => {
  return <>
    <List>
      {vendors.map(vendor => {
        return <ListItemButton key={vendor.id} component='a' href={`/play/vendor/${vendor.id}`} disabled={!vendor.canVisit}>
          <ListItemText
            primary={vendor.name}
          />
        </ListItemButton>
      })}
    </List>
  </>
}