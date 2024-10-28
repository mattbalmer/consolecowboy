import * as React from 'react';
import {
  createTheme,
  ThemeProvider
} from '@mui/material';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { GamePage } from '@client/components/pages/GamePage';
import { OverworldPage } from '@client/components/pages/OverworldPage';
import { CreatePage } from '@client/components/pages/CreatePage';
import { CreateListPage } from '@client/components/pages/CreateListPage';
import { InventoryPage } from '@client/components/pages/InventoryPage';
import { DeckPage } from '@client/components/pages/DeckPage';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

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
        <Route path={'play/inventory'} element={<InventoryPage />} />
        <Route path={'play/deck'} element={<DeckPage />} />
        <Route path={'play/:id'} element={<GamePage />} />
        <Route path={'play'} element={<OverworldPage />} />
        <Route path={'create/:id'} element={<CreatePage />} />
        <Route path={'create'} element={<CreateListPage />} />
      </Route>
      <Route path="" element={<Navigate to='/play' />} />
    </Routes>
  </>
}