import * as React from 'react';
import { FlexCol } from '@client/components/FlexCol';
import { GameScreen } from '@game/components/GameScreen';
import { NavBar } from '@client/components/NavBar';
import { useParams } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { Game } from '@shared/types/game';
import { Level } from '@shared/types/game/level';
import { Typography } from '@mui/material';

export const GamePage = () => {
  let { id } = useParams();

  const [level, setLevel] = useState<Level>(null);

  const player = useMemo<Game['player']>(() => {
    return {
      mental: 10,
      ram: {
        max: 3,
        current: 3,
      },
      money: 0,
      actions: 2,
      stats: {
        icebreaker: 1,
      },
      conditions: [],
    };
  }, []);

  useEffect(() => {
    fetch(`/api/levels/${id}`)
      .then((res) => res.json())
      .then((level) => {
        setLevel(level);
      });
  }, []);

  return <FlexCol sx={{ flexGrow: 1, height: '100vh', background: '#111' }}>
    <NavBar />
    {level ?
      <GameScreen
        levelID={id}
        level={level}
        player={player}
      />
      : <>
        <Typography>...Loading</Typography>
      </>
    }
  </FlexCol>
}