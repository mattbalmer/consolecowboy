import * as React from 'react';
import { FlexCol } from '@client/components/FlexCol';
import { NavBar } from '@client/components/NavBar';
import { useEffect, useState } from 'react';
import { List, ListItemButton, ListItemText, Typography } from '@mui/material';

export const OverworldPage = () => {
  const [levels, setLevels] = useState<number[]>(null);

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
      <List>
        {levels.map(level => {
          return <ListItemButton key={level} component='a' href={`/play/${level}`}>
            <ListItemText primary={`Level ${level}`} />
          </ListItemButton>
        })}
      </List>
      : <>
        <Typography>...Loading</Typography>
      </>
    }
  </FlexCol>
}