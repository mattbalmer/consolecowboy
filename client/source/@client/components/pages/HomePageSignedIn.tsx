import * as React from 'react';
import { MainWithNav } from '@client/components/MainWithNav';
import { FlexCol } from '@client/components/FlexCol';
import { FlexRow } from '@client/components/FlexRow';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@client/states/user';
import { HomePageSignedOut } from '@client/components/pages/HomePageSignedOut';
import { Game } from '@game/components/Game';

export const HomePageSignedIn = () => {
  const navigate = useNavigate();
  // const { user } = useUser();
  // if (!user) {
  //   return <HomePageSignedOut />
  // }

  return <>
    <Game />
  </>
}