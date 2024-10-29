import * as React from 'react';
import { useMemo } from 'react';
import { Deck, DeckSlot, Script } from '@shared/types/game';
import { Box, Divider, Typography } from '@mui/material';
import { FlexCol } from '@client/components/FlexCol';
import { FlexRow } from '@client/components/FlexRow';
import { generate } from '@shared/utils/arrays';

export const ProgramGridItem = ({ i, slot }: {
  i: number,
  slot?: DeckSlot,
}) => {
  const program = slot?.content;
  const isRemoveable = slot?.isRemoveable ?? true;

  return <FlexCol sx={{
    borderRadius: 5,
    border: `1px solid ${isRemoveable ? `#ccc` : `#999` }`,
    p: 1,
    justifyContent: 'space-between',
    width: 60,
    height: 60,
  }}>
    {slot ?
      <>
        <Typography variant={'body2'} sx={{ fontWeight: 'bold' }}>{i} - {program?.id ?? '--'}</Typography>
        <Typography variant={'caption'} sx={{
          alignSelf: 'flex-end',
        }}>{slot.type ?? ''}{isRemoveable ? '' : ' (x)'}</Typography>
      </>
    : null}
  </FlexCol>
}

export const ScriptGridItem = ({ i, script }: {
  i: number,
  script?: Script,
}) => {
  return <FlexCol sx={{
    borderRadius: 5,
    border: `1px solid #ccc`,
    p: 1,
    justifyContent: 'space-between',
    width: 60,
    height: 60,
  }}>
    {script ?
      <>
        <Typography variant={'body2'} sx={{ fontWeight: 'bold' }}>{i} - {script.name}</Typography>
      </>
    : null}
  </FlexCol>
}

export const DeckManager = ({
  deck,
}: {
  deck: Deck,
}) => {
  const renderedPrograms = useMemo<(DeckSlot | null)[]>(
    () => {
      const programs = Object.values(deck.programs);
      const size = programs.length;

      return [
        ...size === -1 ? programs : programs.slice(0, size),
        ...size === -1 ? [] :
          size - programs.length > 0 ? generate(size - programs.length, null)
            : [],
      ];
    },
    [deck.programs]
  );
  const renderedScripts = useMemo<(Script | null)[]>(
    () => {
      const scripts = Object.values(deck.scripts);
      const size = deck.scriptCapacity;

      return [
        ...size === -1 ? scripts : scripts.slice(0, size),
        ...size === -1 ? [] :
          size - scripts.length > 0 ? generate(size - scripts.length, null)
            : [],
      ];
    },
    [deck.scripts, deck.scriptCapacity]
  );

  return <FlexCol>
    <FlexCol>
      <Typography variant={'h6'}>{deck.name}</Typography>
      <Typography variant={'body2'}>{deck.description}</Typography>
    </FlexCol>
    <Typography variant={'subtitle1'} sx={{ mt: 4 }}>Programs</Typography>
    <Divider />
    <FlexRow sx={{ flexWrap: 'wrap' }}>
      {renderedPrograms.map((slot, i) => {
        return <Box key={i} sx={{ m: 1 }}>
          <ProgramGridItem i={i} slot={slot} />
        </Box>
      })}
    </FlexRow>
    <Typography variant={'subtitle1'} sx={{ mt: 4 }}>Scripts</Typography>
    <Divider />
    <FlexRow sx={{ flexWrap: 'wrap' }}>
      {renderedScripts.map((script, i) => {
        return <Box key={i} sx={{ m: 1 }}>
          <ScriptGridItem i={i} script={script} />
        </Box>
      })}
    </FlexRow>
  </FlexCol>
}