import * as React from 'react';
import { useEffect, useState } from 'react';
import { FlexCol } from '@client/components/FlexCol';
import { NavBar } from '@client/components/NavBar';
import { List, ListItemButton, ListItemText, Typography } from '@mui/material';

export const CreateListPage = () => {
  const [levels, setLevels] = useState<number[]>(null);

  useEffect(() => {
    fetch(`/api/levels`)
      .then((res) => res.json())
      .then((levels) => {
        setLevels(levels);
      });
  }, []);

  const nextLevel = levels ? levels[levels.length - 1] + 1 : -1;

  return <FlexCol sx={{ flexGrow: 1, height: '100vh', background: '#111' }}>
    <NavBar />
    {levels ?
      <List>
        {levels.map(level => {
          return <ListItemButton key={level} component='a' href={`/create/${level}`}>
            <ListItemText primary={`Edit level ${level}`} />
          </ListItemButton>
        })}
        <ListItemButton key={nextLevel} component='a' href={`/create/${nextLevel}`}>
          <ListItemText primary={`Create New`} />
        </ListItemButton>
      </List>
      : <>
        <Typography>...Loading</Typography>
      </>
    }
  </FlexCol>
}