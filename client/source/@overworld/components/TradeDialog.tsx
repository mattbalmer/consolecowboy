import * as React from 'react';
import { useMemo, useState } from 'react';
import { Tradeable } from '@shared/types/game';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import { FlexRow } from '@client/components/FlexRow';
import { FlexCol } from '@client/components/FlexCol';
import { TradeableStackForDialog } from '@overworld/components/TradeableStackForDialog';

const TradeList = ({
  required,
  available,
}: {
  required: Tradeable[],
  available: Tradeable[],
}) => {
  return <FlexRow>
    {required.map((tradeable, i) => {
      const availableTradeable = available.find(t => t.urn === tradeable.urn);
      return <TradeableStackForDialog
        key={i}
        tradeable={availableTradeable ?? {
          ...tradeable,
          count: 0,
        }}
        amountNeeded={tradeable.count}
      />
    })}
  </FlexRow>
}

export const TradeDialog = ({
  selling,
  buying,
  playerInventory,
  vendorInventory,
  direction,
  isOpen,
  onConfirm,
  onCancel,
}: {
  selling: Tradeable[],
  buying: Tradeable[],
  playerInventory: Tradeable[],
  vendorInventory: Tradeable[],
  direction: 'buying' | 'selling',
  isOpen: boolean,
  onConfirm: (amount: number) => void,
  onCancel: () => void,
}) => {
  const [amount, setAmount] = useState<number>(1);
  // const buying =

  const canTrade = useMemo(() => {
    return selling.every(sell => {
      const available = playerInventory.find(t => t.urn === sell.urn)?.count ?? 0;
      return available >= sell.count;
    }) && buying.every(buy => {
      const available = vendorInventory.find(t => t.urn === buy.urn)?.count ?? 0;
      return available >= buy.count;
    });
  }, [
    buying,
    selling,
    playerInventory,
    vendorInventory,
    amount,
  ]);

  const handleConfirm = () => {
    if (canTrade) {
      onConfirm(amount);
    } else {
      throw new Error(`Cannot confirm - player or vendor missing required resources`);
    }
  }

  return <Dialog
    open={isOpen ?? false}
    onClose={onCancel}
    aria-labelledby={`trade-dialog-title`}
    aria-describedby={`trade-dialog-description`}
  >
    <DialogTitle id={`trade-dialog-title`}>{direction === 'buying' ? 'Buy' : 'Sell'}</DialogTitle>
    <DialogContent id={`trade-dialog-description`}>
      <FlexRow>
        <FlexCol>
          <Typography variant={'body1'}>You lose</Typography>
          <TradeList
            required={selling}
            available={playerInventory}
          />
        </FlexCol>
        <FlexCol>
          <Typography variant={'body1'}>You gain</Typography>
          <TradeList
            required={buying}
            available={vendorInventory}
          />
        </FlexCol>
      </FlexRow>
    </DialogContent>
    <DialogActions>
      <Button onClick={onCancel} autoFocus>
        {'Cancel'}
      </Button>
      <Button onClick={handleConfirm} variant={'contained'} color={'primary'} disabled={!canTrade}>
        {direction === 'buying' ? 'Buy' : 'Sell'}
      </Button>
    </DialogActions>
  </Dialog>
}