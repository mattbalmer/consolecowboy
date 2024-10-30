import * as React from 'react';
import { List, ListItemButton, ListItemText } from '@mui/material';
import { ZoneID } from '@shared/constants/zones';

export const ZonesList = ({
  zones,
}: {
  zones: {
    id: ZoneID,
    name: string,
    canVisit: boolean,
  }[],
}) => {
  return <>
    <List>
      {zones.map(zone => {
        return <ListItemButton key={zone.id} component='a' href={`/play/zone/${zone.id}`} disabled={!zone.canVisit}>
          <ListItemText
            primary={zone.name}
          />
        </ListItemButton>
      })}
    </List>
  </>
}