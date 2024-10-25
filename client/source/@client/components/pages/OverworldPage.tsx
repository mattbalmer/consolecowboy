import * as React from 'react';
import { FlexCol } from '@client/components/FlexCol';
import { NavBar } from '@client/components/NavBar';
import { useEffect, useMemo, useState } from 'react';
import { Typography } from '@mui/material';
import { OverworldScreen } from '@overworld/components/OverworldScreen';

export const OverworldPage = () => {
  const [levels, setLevels] = useState<string[]>(null);

  useEffect(() => {
    fetch(`/api/levels`)
      .then((res) => res.json())
      .then((levels) => {
        setLevels(levels);
      });
  }, []);

  return <FlexCol sx={{ flexGrow: 1, height: '100vh', background: '#111' }}>
    <NavBar />
    {levels ?
      <OverworldScreen
        levels={levels}
      />
      : <>
        <Typography>...Loading</Typography>
      </>
    }
  </FlexCol>
}