import * as React from 'react';
import { TextField, Typography } from '@mui/material';
import { FlexRow } from '@client/components/FlexRow';
import { FlexCol } from '@client/components/FlexCol';
import { Autocomplete } from '@mui/lab';
import { Command, COMMANDS, Game } from '@game/types';
import { useEffect } from 'react';

export const CommandLine = ({
  onCommand,
  history,
  game,
}: {
  onCommand: (command: Command, ...args: any[]) => void,
  history: string[],
  game: Game,
}) => {
  const [value, setValue] = React.useState<string>('');
  const [input, setInput] = React.useState<string>('');

  const onSubmit = () => {
    const inputs = input.split(' ').filter(_ => !!_);
    if (inputs[0] in COMMANDS) {
      const command = COMMANDS[inputs[0]] === true ? inputs[0] : COMMANDS[inputs[0]];
      onCommand(command as Command, ...inputs.slice(1));
    }
  }

  // @ts-ignore TODO
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter') {
      onSubmit();
    }
  }

  useEffect(() => {
    setInput('');
    setValue('');
  }, [history]);

  useEffect(() => {

  }, []);

  return <FlexRow sx={{ alignItems: 'center', flexGrow: 1 }}>
    <FlexCol sx={{ flexGrow: 1 }}>
      <FlexRow sx={{ alignItems: 'center', flexGrow: 1 }}>
        <Typography variant={'subtitle1'}>Terminal</Typography>
      </FlexRow>
      <FlexRow sx={{ alignItems: 'center', flexGrow: 1 }}>
        <Typography variant={'subtitle1'} sx={{ mr: 1 }}>$</Typography>

        <Autocomplete
          id='command-line'
          freeSolo
          fullWidth
          renderInput={(params) =>
            <TextField
              autoFocus
              variant={'standard'} {...params}
              onKeyDown={onKeyDown}
            />
          }
          value={value}
          onChange={(event: any, newValue: string | null) => {
            if (game.mode === 'PLAY') {
              setValue((newValue || '').toLowerCase());
            }
          }}
          inputValue={input}
          onInputChange={(event, newInputValue) => {
            if (game.mode === 'PLAY') {
              setInput((newInputValue || '').toLowerCase());
            }
          }}
          options={Object.keys(COMMANDS)}
        />
      </FlexRow>
    </FlexCol>
  </FlexRow>
}