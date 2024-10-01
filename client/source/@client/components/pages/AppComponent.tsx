import * as React from 'react';
import {
  createTheme,
  ThemeProvider
} from '@mui/material';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { HomePageSignedIn } from '@client/components/pages/HomePageSignedIn';

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
        <Route index element={<Navigate to='/games' />} />
        <Route path={'games'} element={<HomePageSignedIn />} />
      </Route>
      <Route path="" element={<Navigate to='/playbooks' />} />
    </Routes>
  </>
}