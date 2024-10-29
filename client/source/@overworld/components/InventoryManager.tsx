import * as React from 'react';
import { useMemo } from 'react';
import { Inventory } from '@shared/types/game';
import { Box, Divider, Typography } from '@mui/material';
import { FlexCol } from '@client/components/FlexCol';
import { FlexRow } from '@client/components/FlexRow';
import { Items } from '@shared/constants/items';
import { formatStackCount } from '@shared/utils/game/inventory';
import { generate } from '@shared/utils/arrays';

export const InventoryStack = ({ stack }: {
  stack: Inventory[number],
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
        <Typography variant={'body2'} sx={{ fontWeight: 'bold' }}>{Items[stack.item].name}</Typography>
        <Typography variant={'caption'} sx={{
          alignSelf: 'flex-end',
        }}>{formatStackCount(stack.item, stack.count)}</Typography>
      </>
    : null}
  </FlexCol>
}

export const InventoryManager = ({
  inventory,
  size = -1,
}: {
  inventory: Inventory,
  size?: number,
}) => {
  const rendered = useMemo<(Inventory[number] | null)[]>(
    () => [
      ...size === -1 ? inventory : inventory.slice(0, size),
      ...size === -1 ? [] :
        size - inventory.length > 0 ? generate(size - inventory.length, null)
          : [],
    ],
    [inventory, size]
  );

  return <FlexCol>
    <Typography variant={'subtitle1'}>Inventory</Typography>
    <Divider />
    <FlexRow sx={{ flexWrap: 'wrap' }}>
      {rendered.map((stack, i) => {
        return <Box key={i} sx={{ m: 1 }}>
          <InventoryStack stack={stack} />
        </Box>
      })}
    </FlexRow>
  </FlexCol>
}