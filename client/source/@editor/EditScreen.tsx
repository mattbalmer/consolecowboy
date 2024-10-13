import * as React from 'react';
import { Level } from '@shared/types/game/level';
import { useMemo, useState } from 'react';
import { FlexCol } from '@client/components/FlexCol';
import { GameScreen } from '@game/components/GameScreen';
import { Game } from '@shared/types/game';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography
} from '@mui/material';
import { FlexRow } from '@client/components/FlexRow';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import { getInitialPlayerProps } from '@client/capsules/player';
import { savedPlayerToGamePlayer } from '@shared/utils/game/player';

const hightlightWithLineNumbers = (input: string, language: typeof languages[string]) =>
  highlight(input, language)
    .split('\n')
    .map((line, i) => `<span class='editorLineNumber'>${i + 1}</span>${line}`)
    .join('\n');

export const EditScreen = (props: {
  id: string,
  initialLevel: Level;
}) => {
  const { id, initialLevel } = props;
  const [savedLevel, setSavedLevel] = useState<Level>(initialLevel);
  const [level, setLevel] = useState<Level>(initialLevel);
  const [levelString, setLevelString] = useState<string>(JSON.stringify(level, null, 2));
  const [hasLevelChanged, setHasLevelChanged] = useState<boolean>(false);
  const [hasEdits, setHasEdits] = useState<boolean>(false);
  const [jsonError, setJsonError] = useState<{
    message: string,
    stack: string,
  }>(null);
  const [showJsonStack, setShowJsonStack] = useState<boolean>(false);
  const player = useMemo<Game['player']>(() => savedPlayerToGamePlayer(getInitialPlayerProps()), []);

  const onJSONChange = (newLevelString: string) => {
    // TODO: look into using RSON https://www.relaxedjson.org/download/javascript
    setHasEdits(JSON.stringify(savedLevel, null, 2) !== newLevelString);
    setLevelString(newLevelString);
    try {
      const parsed = JSON.parse(newLevelString);
      setLevel(parsed);
      setHasLevelChanged(
        JSON.stringify(parsed) !== JSON.stringify(savedLevel)
      );
      setJsonError(null);
    } catch (error) {
      setJsonError({
        message: error.message ?? 'Unknown JSON parse error',
        stack: error.stack ?? null,
      });
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
        setHasEdits(false);
      });
  }

  const onReset = () => {
    onJSONChange(JSON.stringify(savedLevel, null, 2));
  }

  return (
    // todo: this magic number from nav height
    <FlexRow sx={{ flexGrow: 1, height: 'calc(100% - 48px)' }}>
      {/* like 33%, but can fiddle later */}
      <FlexCol sx={{ minWidth: 240, maxWidth: 400, width: '33%' }}>
        <FlexRow sx={{ flexGrow: 1, justifyContent: 'space-between' }}>
          <Button
            onClick={onReset}
            disabled={!hasEdits}
            sx={{ flexGrow: 1 }}
          >
            Reset
          </Button>
          <Button
            onClick={onSave}
            disabled={!hasLevelChanged}
            sx={{ flexGrow: 1 }}
          >
            Save
          </Button>
        </FlexRow>
        <FlexCol sx={{ height: '100%', overflowY: 'auto', position: 'relative' }}>
          <Editor
            value={levelString}
            onValueChange={onJSONChange}
            highlight={code => hightlightWithLineNumbers(code, languages.js)}
            padding={10}
            style={{
              fontFamily: `'Fira code', 'Fira Mono', monospace`,
              fontSize: 12,
              overflow: 'visible',
              flexGrow: 1,
              lineHeight: 1.1,
            }}
          />
          {
            jsonError &&
            <Box
              component={'button'}
              sx={{
                position: 'sticky',
                bottom: 0,
                width: `100%`,
                p: 2,
                background: `hsla(350, 10%, 50%, 90%)`,
                border: `1px solid hsla(350, 50%, 65%, 1)`,
                fontSize: '10px',
                cursor: 'pointer',
                textAlign: 'left',
                ':before': {
                  content: `''`,
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  boxShadow: `inset 0 0 50px hsla(350, 10%, 90%, 50%)`,
                  filter: `blur(5px)`,
                },
              }}
              onClick={() => setShowJsonStack(true)}
            >
              <Typography sx={{ color: 'hsla(350, 10%, 90%, 100%)' }}>{jsonError.message}</Typography>
            </Box>
          }
        </FlexCol>
      </FlexCol>
      <GameScreen
        levelID={id}
        level={level}
        player={player}
        shouldBindController={false}
      />
      <Dialog
        open={showJsonStack}
        onClose={() => setShowJsonStack(false)}
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
      >
        <DialogTitle id='alert-dialog-title'>JSON Parse Error</DialogTitle>
        <DialogContent>
          <DialogContentText id='alert-dialog-description'>
            <p style={{ fontSize: '12px' }}>{jsonError?.message}</p>
            <pre style={{ fontSize: '12px' }}>
              {jsonError?.stack}
            </pre>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowJsonStack(false)} autoFocus>
            Okay
          </Button>
        </DialogActions>
      </Dialog>
    </FlexRow>
  );
}