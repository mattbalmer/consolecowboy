import * as React from 'react';
import { FlexCol } from '@client/components/FlexCol';
import { NavBar } from '@client/components/NavBar';
import { useParams } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { Level } from '@shared/types/game/level';
import { Typography } from '@mui/material';
import { EditScreen } from '@editor/EditScreen';

export const CreatePage = (props) => {
  const { id } = useParams();
  const levelID = parseInt(id, 10);
  const [level, setLevel] = useState<Level>(null);

  useEffect(() => {
    fetch(`/api/levels/${levelID}`)
      .then((res) => res.json())
      .then((level) => {
        setLevel(level);
      });
  }, []);

  return <FlexCol sx={{ flexGrow: 1, height: '100vh', background: '#111' }}>
    <NavBar />
    {level ?
      <EditScreen id={levelID} initialLevel={level} />
      : <>
        <Typography>...Loading</Typography>
      </>
    }
  </FlexCol>
}