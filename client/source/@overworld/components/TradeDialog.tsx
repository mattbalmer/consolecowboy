import * as React from 'react';
import { useMemo, useState } from 'react';
import { Tradeable } from '@shared/types/game';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import { FlexRow } from '@client/components/FlexRow';
import { FlexCol } from '@client/components/FlexCol';
import { TradeableStackForDialog } from '@overworld/components/TradeableStackForDialog';
import { NumberInput } from '@client/components/NumberInput';

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
  fromPlayer,
  fromVendor,
  playerInventory,
  vendorInventory,
  direction,
  isOpen,
  onConfirm,
  onCancel,
}: {
  fromPlayer: Tradeable[],
  fromVendor: Tradeable[],
  playerInventory: Tradeable[],
  vendorInventory: Tradeable[],
  direction: 'buying' | 'selling',
  isOpen: boolean,
  onConfirm: (amount: number) => void,
  onCancel: () => void,
}) => {
  const [amount, setAmount] = useState<number>(1);
  const maxAmount = useMemo(() => {
    return direction === 'buying'
      ? fromVendor.reduce((min, t) => Math.min(min, t.count), Infinity)
      : fromPlayer.reduce((min, t) => Math.min(min, t.count), Infinity);
  }, [direction, fromVendor, fromPlayer]);
  const priceForVendor = useMemo(() => {
    return fromVendor.map(t => ({
      ...t,
      count: direction === 'buying' ? amount : t.count * amount,
    }))
  }, [fromVendor, amount, direction]);
  const priceForPlayer = useMemo(() => {
    return fromPlayer.map(t => ({
      ...t,
      count: direction === 'selling' ? amount : t.count * amount,
    }))
  }, [fromPlayer, amount, direction]);

  const playerCanAfford = useMemo(() => {
    return priceForPlayer.every(sell => {
      const available = playerInventory.find(t => t.urn === sell.urn)?.count ?? 0;
      return available >= sell.count;
    });
  }, [
    priceForPlayer,
    playerInventory,
  ]);

  const vendorCanAfford = useMemo(() => {
    return priceForVendor.every(buy => {
      const available = vendorInventory.find(t => t.urn === buy.urn)?.count ?? 0;
      return available >= buy.count;
    });
  }, [
    priceForVendor,
    vendorInventory,
  ]);

  const handleConfirm = () => {
    if (playerCanAfford && vendorCanAfford) {
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
      <FlexCol>
        <Typography variant={'body1'}>Amount</Typography>
        <NumberInput
          value={amount}
          onChange={(e, v) => setAmount(v)}
          min={1}
          max={maxAmount}
        />
        <FlexRow>
          <FlexCol>
            <Typography variant={'body1'}>You lose</Typography>
            <TradeList
              required={priceForPlayer}
              available={playerInventory}
            />
          </FlexCol>
          <FlexCol>
            <Typography variant={'body1'}>You gain</Typography>
            <TradeList
              required={priceForVendor}
              available={vendorInventory}
            />
          </FlexCol>
        </FlexRow>
      </FlexCol>
    </DialogContent>
    <DialogActions>
      <Button onClick={onCancel} autoFocus>
        {'Cancel'}
      </Button>
      <Button onClick={handleConfirm} variant={'contained'} color={'primary'} disabled={!(playerCanAfford && vendorCanAfford)}>
        {direction === 'buying' ? 'Buy' : 'Sell'}
      </Button>
    </DialogActions>
  </Dialog>
}