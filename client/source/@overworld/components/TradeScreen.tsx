import * as React from 'react';
import { useEffect, useMemo } from 'react';
import { FlexCol } from '@client/components/FlexCol';
import { Box, Button, Divider, Typography } from '@mui/material';
import { useOverworld } from '@overworld/hooks/use-overworld';
import { SimpleDialog } from '@client/components/SimpleDialog';
import { FlexRow } from '@client/components/FlexRow';
import { Tradeable, TradeableURN, Vendor } from '@shared/types/game';
import { useCapsuleField } from '@client/hooks/use-capsule';
import { vendorsCapsule } from '@client/capsules/vendors';
import { VendorID } from '@shared/constants/vendors';
import { TradeManager } from '@overworld/components/TradeManager';
import { getTradeablePrice, toTradeable } from '@shared/utils/game/tradeables';
import { TradeDialog } from '@overworld/components/TradeDialog';

export const TradeScreen = ({
  vendor: vendorInitial,
}: {
  vendor: Vendor,
}) => {
  const {
    player, setPlayer,
    dialog, setDialog,
  } = useOverworld('vendor');
  const [vendor, setVendor] = useCapsuleField(vendorsCapsule, vendorInitial.id as VendorID);
  const [confirmTradeDirection, setConfirmTradeDirection] = React.useState<'buying' | 'selling' | null>(null);
  const [confirmTradeTradeable, setConfirmTradeTradeable] = React.useState<Tradeable | null>(null);

  const playerSelling = useMemo(() => {
    const selling: Tradeable[] = [];

    player.inventory.forEach((stack, i) => {
      selling.push(
        toTradeable(`item:${stack.item}`, stack.count)
      );
    });

    player.implants.forEach((implant, i) => {
      selling.push(
        toTradeable(`implant:${implant}`)
      );
    });

    selling.push(
      toTradeable(`deck:${player.deck.id}`)
    );

    Object.values(player.deck.programs).filter(program => !!program?.content).forEach((program, i) => {
      selling.push(
        toTradeable(`program:${program.content}`)
      );
    });

    player.deck.scripts.forEach((script, i) => {
      selling.push(
        toTradeable(`script:${script.id}`, 1, script.props)
      );
    });

    return selling;
  }, [player.inventory, player.implants, player.deck.id, player.deck.programs, player.deck.scripts]);

  const confirmTradeTradeablePrice = useMemo(() => {
    return confirmTradeTradeable ?
      (Object.entries(confirmTradeTradeable.price) as [TradeableURN, number][])
        .map<Tradeable>(([urn, count]) => {
          return toTradeable(urn, count);
        })
      : null;
  }, [confirmTradeTradeable]);

  const handlePlayerBuy = (tradeable: Tradeable) => {
    setConfirmTradeTradeable(tradeable);
    setConfirmTradeDirection('buying');
  }

  const handlePlayerSell = (tradeable: Tradeable) => {
    setConfirmTradeTradeable(tradeable);
    setConfirmTradeDirection('selling');
  }

  const onConfirmTrade = (amount: number) => {
    console.log('confirm', confirmTradeDirection, confirmTradeTradeable, confirmTradeTradeablePrice);
  }

  const onCancelTrade = () => {
    setConfirmTradeTradeable(null);
    setConfirmTradeDirection(null);
  }

  return <FlexCol sx={{ flexGrow: 1, p: 2 }}>
    <Typography variant={'h5'} sx={{ mb: 2 }}>Overworld &gt; Vendor &gt; {vendor.name}</Typography>
    <FlexRow sx={{ mb: 2 }}>
      <FlexCol sx={{ flexGrow: 0 }}>
        <Typography variant={'subtitle1'}>Actions</Typography>
        <Divider />
        <Button href={`/play/zone/${player.lastZone}`}>Back to Overworld</Button>
      </FlexCol>
    </FlexRow>
    <Box>
      <TradeManager
        playerSelling={playerSelling}
        vendor={vendor}
        onPlayerBuy={handlePlayerBuy}
        onPlayerSell={handlePlayerSell}
      />
    </Box>
    <SimpleDialog
      id={'inventory-dialog'}
      isOpen={!!dialog}
      title={dialog?.title}
      body={dialog?.body}
      acknowledge={dialog?.acknowledge}
      onClose={dialog?.onFinish}
    />
    {!!confirmTradeDirection && !!confirmTradeTradeable && !!confirmTradeTradeablePrice &&
      <TradeDialog
        isOpen={true}
        selling={confirmTradeDirection === 'selling' ? [confirmTradeTradeable] : confirmTradeTradeablePrice}
        buying={confirmTradeDirection === 'buying' ? [confirmTradeTradeable] : confirmTradeTradeablePrice}
        playerInventory={playerSelling}
        vendorInventory={vendor.inventory}
        direction={confirmTradeDirection}
        onConfirm={onConfirmTrade}
        onCancel={onCancelTrade}
      />
    }
  </FlexCol>
}