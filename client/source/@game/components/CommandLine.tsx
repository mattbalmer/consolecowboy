import * as React from 'react';
import { Box, Divider, TextField, Typography } from '@mui/material';
import { FlexRow } from '@client/components/FlexRow';
import { FlexCol } from '@client/components/FlexCol';
import { Autocomplete } from '@mui/lab';
import { CLIMessage, Command, COMMANDS, Game } from '@game/types';
import { useEffect } from 'react';

const CLIHistoryEntry = ({
  line,
  i,
}: {
  line: CLIMessage,
  i: number,
}) => {
  const color = ({
    'error': '#cc6666',
    'output': '#ffffff99',
    'command': '#ffffffee',
    'hidden': '#ffffff00',
  } satisfies Record<CLIMessage['type'], string>)[line.type];
  return <Typography
    variant={'subtitle2'}
    data-cli-output={i}
    data-cli-output-type={line.type}
  >
    <pre style={{ color, paddingLeft: line.type === 'output' || line.type === 'error' ? '0.7rem' : 0 }}>{
      line.type === 'command' ? <span style={{ display: 'inline-block', color: 'aqua', marginRight: 3 }}>$</span> : null
    }{line.value}</pre>
  </Typography>
}

export const CommandLine = ({
  onCommand,
  game,
}: {
  onCommand: (command: Command, ...args: any[]) => void,
  game: Game,
}) => {
  const [value, setValue] = React.useState<string>('');
  const [input, setInput] = React.useState<string>('');

  const onSubmit = () => {
    const inputs = input.match(/(".*?"|[^"\s]+)+(?=\s*|\s*$)/g)
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
  }, [game.history.terminal]);

  return <FlexCol data-cli sx={{ flexGrow: 1 }}>
    <Box
      data-cli-output
      sx={{ display: 'flex', flexDirection: 'column-reverse', overflowY: 'auto', flexGrow: 1, pb: 1, maxHeight: 120 }}
    >
      {
        game.history.terminal.filter(line => line.type !== 'hidden').reverse().map((line, index) => {
          return <CLIHistoryEntry
            key={index}
            i={index}
            line={line}
          />
        })
      }
    </Box>
    <Divider sx={{ mb: 1 }} />
    <FlexCol sx={{ flexGrow: 1, pb: 1 }}>
      <FlexRow sx={{ flexGrow: 1 }}>
        <Typography variant={'subtitle1'} sx={{ mr: 1 }}>$</Typography>

        <Autocomplete
          id='command-line'
          freeSolo
          fullWidth
          data-cli-input
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
  </FlexCol>
}