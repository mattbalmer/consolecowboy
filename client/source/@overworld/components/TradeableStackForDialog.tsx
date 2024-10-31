import * as React from 'react';
import { Tradeable } from '@shared/types/game';
import { FlexCol } from '@client/components/FlexCol';
import { Typography } from '@mui/material';
import { formatItemCount } from '@shared/utils/game/inventory';

export const TradeableStackForDialog = ({
  tradeable,
  amountNeeded: amountNeededRaw,
}: {
  tradeable: Tradeable,
  amountNeeded?: number,
}) => {
  const [,id] = tradeable.urn.split(':');
  const amountNeeded = amountNeededRaw ?? tradeable.count;
  const hasAmountNeeded = tradeable.count >= amountNeeded;

  const amountAvailableFormatted = tradeable.type === 'item'
    ? formatItemCount(id, tradeable.count)
    : `${tradeable.count}`;

  const amountNeededFormatted = tradeable.type === 'item'
    ? formatItemCount(id, amountNeeded)
    : `${amountNeeded}`;

  return <FlexCol sx={{
    borderRadius: 5,
    border: `1px solid ${hasAmountNeeded ? `#ccc` : `#c66`}`,
    p: 1,
    justifyContent: 'space-between',
    width: 60,
    height: 60,
  }}>
    <Typography variant={'body2'} sx={{ fontWeight: 'bold' }}>{id}</Typography>
    <Typography variant={'caption'} sx={{
      alignSelf: 'flex-end',
    }}>{
      (amountNeededRaw === undefined)
        ? (tradeable.count === -1 ? <>&infin;</> : amountAvailableFormatted)
        : hasAmountNeeded ? (amountNeeded === -1 ? <>&infin;</> : amountNeededFormatted)
        : <>
          {tradeable.count === -1 ? <>&infin;</> : amountAvailableFormatted} / {amountNeeded === -1 ? <>&infin;</> : amountNeededFormatted}
        </>
    }</Typography>
  </FlexCol>
}