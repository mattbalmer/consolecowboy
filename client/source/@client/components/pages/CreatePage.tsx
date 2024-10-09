import * as React from 'react';
import { FlexCol } from '@client/components/FlexCol';
import { NavBar } from '@client/components/NavBar';
import { EditScreen } from '@editor/EditScreen';
import { useParams } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { Level } from '@shared/types/game/level';
import { Typography } from '@mui/material';

export const CreatePage = () => {
  const { id } = useParams();
  const [level, setLevel] = useState<Level>(null);

  const levelID = useMemo(() => parseInt(id, 10), [id]);

  console.log('page refresh why', levelID);

  fetch(`/api/levels/${levelID}`)
    .then((res) => res.json())
    .then((level) => {
      setLevel(level);
    });

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