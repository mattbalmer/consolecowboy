import * as React from 'react';
import {
  AppBar,
  Avatar,
  Box,
  Button,
  IconButton,
  ListItemText,
  ListSubheader,
  Menu,
  MenuItem,
  styled,
  Toolbar,
  Tooltip,
  Typography
} from '@mui/material';
import { SxProps } from '@mui/system';
import { Theme } from '@mui/material/styles';
import { BoxProps } from '@mui/material/Box/Box';
import { NavDrawer } from '@client/components/NavDrawer';
import { FlexRow } from '@client/components/FlexRow';
import { FlexCol } from '@client/components/FlexCol';
import { useUser } from '@client/states/user';

const DRAWER_WIDTH = 250;

const ProfileMenu = styled(Menu)({
  '& .MuiMenu-paper': {
    marginTop: '45px',
  },
  '& .MuiList-root': {
    padding: 0,
  },
  '& .MuiListSubheader-root': {
    paddingTop: '8px',
    paddingBottom: '8px',
    fontSize: '12px',
    opacity: 0.8,
  },
});

export const MainWithNav = ({ selected, children, sx, ...props }: {
  selected: Parameters<typeof NavDrawer>[0]['selected'],
  children?: React.JSX.Element[] | React.JSX.Element,
  sx?: SxProps<Theme>,
  props?: BoxProps[],
}) => {
  const { user } = useUser();

  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogoutClick = () => {
    handleCloseUserMenu();
    window.location.href = '/auth/logout';
  }

  return <FlexCol>
    <AppBar position='static' sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <Typography variant='h6' component='div' sx={{ flexGrow: 1 }}>
          Netrunner
        </Typography>
        <FlexRow>
          { user
            ?
              <>
                <Box sx={{ flexGrow: 0 }}>
                  <Tooltip title="Open settings">
                    <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                      <Avatar
                        alt={user.profile.name}
                        src={user.profile.avatar}
                      />
                    </IconButton>
                  </Tooltip>
                  <ProfileMenu
                    id='profile-menu'
                    anchorEl={anchorElUser}
                    anchorOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    keepMounted
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    open={Boolean(anchorElUser)}
                    onClose={handleCloseUserMenu}
                  >
                    <ListSubheader sx={{ lineHeight: 1, background: 'none' }}>{user.contact.email}</ListSubheader>
                    <MenuItem onClick={handleLogoutClick}>
                      <ListItemText>Logout</ListItemText>
                    </MenuItem>
                  </ProfileMenu>
                </Box>
              </>
            : <>
                <Button href={'/auth/google'}>Login</Button>
              </>
          }
        </FlexRow>
      </Toolbar>
    </AppBar>
    <FlexRow>
      {/*<NavDrawer*/}
      {/*  selected={selected}*/}
      {/*  width={DRAWER_WIDTH}*/}
      {/*/>*/}
      <Box sx={{
        ...sx,
        display: 'flex',
        flexDirection: 'column',
        paddingLeft: `${DRAWER_WIDTH}px`,
        flexGrow: 1,
      }}
        {...props}
      >
        {children}
      </Box>
    </FlexRow>
  </FlexCol>
}