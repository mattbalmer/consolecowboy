import * as React from 'react';
import { Tradeable } from '@shared/types/game';
import { FlexCol } from '@client/components/FlexCol';
import { Typography } from '@mui/material';
import { formatStackCount } from '@shared/utils/game/inventory';

export const TradeableStack = ({
  tradeable,
}: {
  tradeable: Tradeable,
}) => {
  const [,id] = tradeable.urn.split(':');

  return <FlexCol sx={{
    borderRadius: 5,
    border: `1px solid #ccc`,
    p: 1,
    justifyContent: 'space-between',
    width: 60,
    height: 60,
  }}>
    <Typography variant={'body2'} sx={{ fontWeight: 'bold' }}>{id}</Typography>
    <Typography variant={'caption'} sx={{
      alignSelf: 'flex-end',
    }}>{
      tradeable.count === -1 ? <>&infin;</> :
        tradeable.type === 'item' ? formatStackCount(id, tradeable.count, 'never') : tradeable.count
    }</Typography>
  </FlexCol>
}
