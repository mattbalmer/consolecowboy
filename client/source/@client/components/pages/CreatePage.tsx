import * as React from 'react';
import { useEffect, useState } from 'react';
import { FlexCol } from '@client/components/FlexCol';
import { NavBar } from '@client/components/NavBar';
import { useParams } from 'react-router-dom';
import { Level } from '@shared/types/game/level';
import { Typography } from '@mui/material';
import { EditScreen } from '@editor/EditScreen';

export const CreatePage = (props) => {
  const { id } = useParams();
  const [level, setLevel] = useState<Level>(null);

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
      <EditScreen id={id} initialLevel={level} />
      : <>
        <Typography>...Loading</Typography>
      </>
    }
  </FlexCol>
}