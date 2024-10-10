import * as React from 'react';
import { Level } from '@shared/types/game/level';
import { useMemo, useState } from 'react';
import { FlexCol } from '@client/components/FlexCol';
import { GameScreen } from '@game/components/GameScreen';
import { Game } from '@shared/types/game';
import { Button } from '@mui/material';
import { FlexRow } from '@client/components/FlexRow';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';

export const EditScreen = (props: {
  id: number,
  initialLevel: Level;
}) => {
  const { id, initialLevel } = props;
  const [savedLevel, setSavedLevel] = useState<Level>(initialLevel);
  const [level, setLevel] = useState<Level>(initialLevel);
  const [levelString, setLevelString] = useState<string>(JSON.stringify(level, null, 2));
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

  const onJSONChange = (newLevelString: string) => {
    // TODO: look into using RSON https://www.relaxedjson.org/download/javascript
    setLevelString(newLevelString);
    try {
      const parsed = JSON.parse(newLevelString);
      setLevel(parsed);
      setHasLevelChanged(
        JSON.stringify(parsed) !== JSON.stringify(savedLevel)
      );
    } catch (error) {
      console.log('parse error', error);
    }
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
        setHasLevelChanged(false);
      });
  }

  return (
    // todo: this magic number from nav height
    <FlexRow sx={{ flexGrow: 1, height: 'calc(100% - 48px)' }}>
      {/* like 33%, but can fiddle later */}
      <FlexCol sx={{ minWidth: 240, maxWidth: 400, width: '33%' }}>
        <Button
          onClick={onSave}
          disabled={!hasLevelChanged}
        >
          Save
        </Button>
        <FlexCol sx={{ height: '100%', overflowY: 'auto' }}>
          <Editor
            value={levelString}
            onValueChange={onJSONChange}
            highlight={code => highlight(levelString, languages.js)}
            padding={10}
            style={{
              fontFamily: '"Fira code", "Fira Mono", monospace',
              fontSize: 12,
              overflow: 'visible',
              flexGrow: 1,
            }}
          />
        </FlexCol>
      </FlexCol>
      <GameScreen level={level} player={player} />
    </FlexRow>
  );
}