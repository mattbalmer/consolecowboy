import * as React from 'react';
import {
  createTheme,
  ThemeProvider
} from '@mui/material';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { GamePage } from '@client/components/pages/GamePage';
import { CreatePage } from '@client/components/pages/CreatePage';

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
        <Route path={'play'} element={<GamePage />} />
        <Route path={'create'} element={<CreatePage />} />
      </Route>
      <Route path="" element={<Navigate to='/play' />} />
    </Routes>
  </>
}