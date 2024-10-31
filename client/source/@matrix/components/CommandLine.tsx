import * as React from 'react';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { Box, Divider, TextField, Typography } from '@mui/material';
import { FlexRow } from '@client/components/FlexRow';
import { FlexCol } from '@client/components/FlexCol';
import { Autocomplete } from '@mui/lab';
import { CLIMessage, CoreCommand, CORE_COMMANDS, Game } from '@matrix/types';

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
  bindArrowKeys,
}: {
  onCommand: (command: CoreCommand, ...args: any[]) => void,
  game: Game,
  bindArrowKeys: boolean,
}) => {
  const inputRef = useRef<HTMLInputElement>();
  const [value, setValue] = React.useState<string>('');
  const [input, setInput] = React.useState<string>('');
  const [hovered, setHovered] = React.useState<number | null>(null);

  const commandsHistory = useMemo(() => {
    return game.history.terminal.filter(line => line.type === 'command').map(line => line.value);
  }, [game.history.terminal]);

  const onSubmit = useCallback(() => {
    if (!input) {
      return;
    }
    const inputs = input.match(/(".*?"|[^"\s]+)+(?=\s*|\s*$)/g);
    const command = inputs[0];
    onCommand(command as CoreCommand, ...inputs.slice(1));

    // if (inputs[0] in COMMANDS) {
    //   const command = COMMANDS[inputs[0]] === true ? inputs[0] : COMMANDS[inputs[0]];
    //   onCommand(command as Command, ...inputs.slice(1));
    // }
  }, [input, onCommand]);

  // @ts-ignore TODO
  const onInputKeyDown = useCallback((event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      onSubmit();
    }
  }, [onSubmit])

  // @ts-ignore TODO
  const onDocKeyDown = useCallback((event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      inputRef?.current?.focus();
      if (hovered === null) {
        setHovered(commandsHistory.length - 1);
      } else {
        setHovered(hovered > 0 ? hovered - 1 : commandsHistory.length - 1);
      }
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (document.activeElement && document.activeElement === inputRef?.current) {
        if (hovered !== null) {
          setHovered(hovered < commandsHistory.length - 1 ? hovered + 1 : 0);
        } else {
          setHovered(0);
        }
      } else {
        inputRef?.current?.focus();
      }
    }
  }, [hovered, inputRef.current, commandsHistory])

  const onBlur = () => {
    setHovered(null);
  }

  useEffect(() => {
    if (hovered !== null && hovered > -1 && hovered < commandsHistory.length) {
      setValue(commandsHistory[hovered]);
      setInput(commandsHistory[hovered]);
    }
  }, [hovered, commandsHistory]);

  useEffect(() => {
    setInput('');
    setValue('');
    setHovered(null);
  }, [game.history.terminal]);

  useEffect(() => {
    if (bindArrowKeys) {
      document.addEventListener('keydown', onDocKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', onDocKeyDown);
    }
  }, [onDocKeyDown, bindArrowKeys]);

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
              onKeyDown={onInputKeyDown}
              inputRef={inputRef}
              onBlur={onBlur}
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
          options={Object.keys(CORE_COMMANDS)}
        />
      </FlexRow>
    </FlexCol>
  </FlexCol>
}