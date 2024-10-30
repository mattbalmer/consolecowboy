import * as React from 'react';
import { createTheme, ThemeProvider } from '@mui/material';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { GamePage } from '@client/components/pages/GamePage';
import { CreatePage } from '@client/components/pages/CreatePage';
import { CreateListPage } from '@client/components/pages/CreateListPage';
import { InventoryPage } from '@client/components/pages/InventoryPage';
import { DeckPage } from '@client/components/pages/DeckPage';
import { ImplantsPage } from '@client/components/pages/ImplantsPage';
import { VendorPage } from '@client/components/pages/VendorPage';
import { ZonePage } from '@client/components/pages/ZonePage';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

const ForceNav = ({ to }: { to: string }) => {
  window.location.href = to;
  return <></>
}

const AppLayout = () => {
  return <>
    <ThemeProvider theme={darkTheme}>
      <Outlet />
    </ThemeProvider>
  </>
}

export const AppComponent = () => {
  return <>
    <Routes>
      <Route path={'/'} element={<AppLayout />}>
        <Route index element={<Navigate to='/play' />} />
        <Route path={'play/zone/:zone'} element={<ZonePage />} />
        <Route path={'play/zone'} element={<ZonePage />} />
        <Route path={'play/vendor/:id'} element={<VendorPage />} />
        <Route path={'play/inventory'} element={<InventoryPage />} />
        <Route path={'play/deck'} element={<DeckPage />} />
        <Route path={'play/implants'} element={<ImplantsPage />} />
        <Route path={'play/:id'} element={<GamePage />} />
        {/*<Route path={'play'} element={<OverworldPage />} />*/}
        <Route path={'play'} element={<ForceNav to={'/play/zone'} />} />
        <Route path={'create/:id'} element={<CreatePage />} />
        <Route path={'create'} element={<CreateListPage />} />
      </Route>
      <Route path="" element={<ForceNav to={'/play/zone'} />} />
    </Routes>
  </>
}