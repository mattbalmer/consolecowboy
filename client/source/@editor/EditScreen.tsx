import * as React from 'react';
import { Level } from '@shared/types/game/level';
import { useEffect, useMemo, useRef, useState } from 'react';
import { FlexCol } from '@client/components/FlexCol';
import { GameScreen } from '@game/components/GameScreen';
import { Game } from '@shared/types/game';
import { Button } from '@mui/material';
import JSONEditorReact from '@client/components/JSONEditorReact';
import { FlexRow } from '@client/components/FlexRow';

function useTraceUpdate(props) {
  const prev = useRef(props);
  useEffect(() => {
    const changedProps = Object.entries(props).reduce((ps, [k, v]) => {
      if (prev.current[k] !== v) {
        ps[k] = [prev.current[k], v];
      }
      return ps;
    }, {});
    if (Object.keys(changedProps).length > 0) {
      console.log('Changed props:', changedProps);
    }
    prev.current = props;
  });
}

export const EditScreen = (props: {
  id: number,
  initialLevel: Level;
}) => {
  const { id, initialLevel } = props;
  const [savedLevel, setSavedLevel] = useState<Level>(initialLevel);
  const [level, setLevel] = useState<Level>(initialLevel);
  const [hasLevelChanged, setHasLevelChanged] = useState<boolean>(false);
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

  useTraceUpdate(props)

  const onJSONChange = (value: Level) => {
    console.log('json change', value);
    setLevel(value);
  }

  const onSave = () => {
    fetch(`/api/levels/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(level),
    })
      .then(() => {
        setSavedLevel(level);
        setLevel(level);
        setHasLevelChanged(false);
      });
  }

  console.log('rerender why');

  return (
    <FlexRow sx={{ flexGrow: 1, basis: 1 }}>
      <FlexCol sx={{ flexGrow: 1 }}>
        <Button
          onClick={onSave}
          disabled={!hasLevelChanged}
        >
          Save
        </Button>
        <JSONEditorReact json={savedLevel} onChange={onJSONChange} />
      </FlexCol>
      <GameScreen level={level} player={player} />
    </FlexRow>
  );
}