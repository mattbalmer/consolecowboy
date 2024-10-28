import * as React from 'react';
import { Player } from '@shared/types/game';
import { Box, Divider, Typography } from '@mui/material';
import { FlexCol } from '@client/components/FlexCol';
import { FlexRow } from '@client/components/FlexRow';
import { generate } from '@shared/utils/arrays';
import { useMemo } from 'react';
import { formatStackCount } from '@shared/utils/game/inventory';

export const DeckStack = ({ stack }: {
  stack: Player['deck'][number],
}) => {
  return <FlexCol sx={{
    borderRadius: 5,
    border: `1px solid #ccc`,
    p: 1,
    justifyContent: 'space-between',
    width: 60,
    height: 60,
  }}>
    {stack ?
      <>
        <Typography variant={'body2'} sx={{ fontWeight: 'bold' }}>{stack.split(':')[1]}</Typography>
        <Typography variant={'caption'} sx={{
          alignSelf: 'flex-end',
        }}>{stack.split(':')[0]}</Typography>
      </>
    : null}
  </FlexCol>
}

export const DeckManager = ({
  deck,
  size = -1,
}: {
  deck: Player['deck'],
  size?: number,
}) => {
  const rendered = useMemo<(Player['deck'][number] | null)[]>(
    () => [
      ...size === -1 ? deck : deck.slice(0, size),
      ...size === -1 ? [] :
        size - deck.length > 0 ? generate(size - deck.length, null)
          : [],
    ],
    [deck, size]
  );

  return <FlexCol>
    <Typography variant={'subtitle1'}>Inventory</Typography>
    <Divider />
    <FlexRow sx={{ flexWrap: 'wrap' }}>
      {rendered.map((stack, i) => {
        return <Box key={i} sx={{ m: 1 }}>
          <DeckStack stack={stack} />
        </Box>
      })}
    </FlexRow>
  </FlexCol>
}