import * as React from 'react';
import { List, ListItemButton, ListItemText } from '@mui/material';
import { Player } from '@shared/types/game';

export const LevelsList = ({
  levels,
  history,
}: {
  levels: string[],
  history: Player['history'],
}) => {
  return <>
    <List>
      {levels.map(level => {
        const isAvailable = history.hasOwnProperty(level);
        const hasCompleted = history.hasOwnProperty(level) && history[level][1] > 0;
        return <ListItemButton key={level} component='a' href={`/play/${level}`} disabled={!isAvailable || hasCompleted}>
          <ListItemText
            primary={`Level ${level}`}
          />
        </ListItemButton>
      })}
    </List>
  </>
}