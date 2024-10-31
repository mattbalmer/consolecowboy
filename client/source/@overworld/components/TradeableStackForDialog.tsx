import * as React from 'react';
import { Tradeable } from '@shared/types/game';
import { FlexCol } from '@client/components/FlexCol';
import { Typography } from '@mui/material';
import { TradeableCount } from '@game/components/TradeableCount';

export const TradeableStackForDialog = ({
  tradeable,
  amountNeeded: amountNeededRaw,
}: {
  tradeable: Tradeable,
  amountNeeded?: number,
}) => {
  const [,id] = tradeable.urn.split(':');
  const amountAvailable = tradeable.count;
  const amountNeeded = amountNeededRaw ?? tradeable.count;
  const hasAmountNeeded = amountAvailable >= amountNeeded;

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
      hasAmountNeeded ? <TradeableCount urn={tradeable.urn} count={amountNeeded} />
        : <>
          <TradeableCount urn={tradeable.urn} count={amountAvailable} /> / <TradeableCount urn={tradeable.urn} count={amountNeeded} />
        </>
    }</Typography>
  </FlexCol>
}