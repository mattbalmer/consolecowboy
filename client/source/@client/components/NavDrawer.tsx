import * as React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar
} from '@mui/material';
import { FlexCol } from '@client/components/FlexCol';
import { useNavigate } from 'react-router-dom';
import TodayIcon from '@mui/icons-material/Today';
import DateRangeIcon from '@mui/icons-material/DateRange';

export const NavDrawer = ({
  selected,
  width,
}: {
  selected: 'playbooks' | 'templates',
  width: number,
}) => {
  const navigate = useNavigate();

  return <>
    <Drawer
      anchor={'left'}
      open={true}
      variant='persistent'
    >
      <Toolbar />
      <FlexCol sx={{
        width: width
      }}>
        <List
          component={'nav'}
          sx={{
            width: '100%',
          }}
        >
          <ListItem disablePadding>
            <ListItemButton selected={selected === 'playbooks'} onClick={() => navigate('/playbooks')}>
              <ListItemIcon>
                <TodayIcon />
              </ListItemIcon>
              <ListItemText primary={'Playbooks'} />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton selected={selected === 'templates'} onClick={() => navigate('/templates')}>
              <ListItemIcon>
                <DateRangeIcon />
              </ListItemIcon>
              <ListItemText primary={'Templates'} />
            </ListItemButton>
          </ListItem>
        </List>
      </FlexCol>
    </Drawer>
  </>
}