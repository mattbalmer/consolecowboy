import * as React from 'react';
import { FlexCol } from '@client/components/FlexCol';
import { GameScreen } from '@game/components/GameScreen';
import { NavBar } from '@client/components/NavBar';

export const GamePage = () => {
  return <FlexCol sx={{ flexGrow: 1, height: '100vh', background: '#111' }}>
    <NavBar />
    <GameScreen />
  </FlexCol>
}