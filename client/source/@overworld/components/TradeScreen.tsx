import * as React from 'react';
import { useMemo } from 'react';
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
import { toTradeable } from '@shared/utils/game/tradeables';
import { TradeDialog } from '@overworld/components/TradeDialog';

const getTradeableCostInTradeables = (tradeable: Tradeable): Tradeable[] => {
  if (!tradeable) {
    return [];
  }

  return (Object.entries(tradeable.price) as [TradeableURN, number][])
    .map<Tradeable>(([urn, count]) => {
      return toTradeable(urn, count);
    });
}

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
  const [confirmTradeFromPlayer, setConfirmTradeFromPlayer] = React.useState<Tradeable[]>([]);
  const [confirmTradeFromVendor, setConfirmTradeFromVendor] = React.useState<Tradeable[]>([]);

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

  const handlePlayerBuy = (tradeable: Tradeable) => {
    setConfirmTradeFromVendor([tradeable]);
    setConfirmTradeFromPlayer(getTradeableCostInTradeables(tradeable));
    setConfirmTradeDirection('buying');
  }

  const handlePlayerSell = (tradeable: Tradeable) => {
    setConfirmTradeFromVendor(getTradeableCostInTradeables(tradeable));
    setConfirmTradeFromPlayer([tradeable]);
    setConfirmTradeDirection('selling');
  }

  const onConfirmTrade = (amount: number) => {
    console.log('confirm', amount, confirmTradeDirection, confirmTradeFromPlayer, confirmTradeFromVendor);
  }

  const onCancelTrade = () => {
    setConfirmTradeFromVendor([]);
    setConfirmTradeFromPlayer([]);
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
    {!!confirmTradeDirection &&
      <TradeDialog
        isOpen={true}
        fromPlayer={confirmTradeFromPlayer}
        fromVendor={confirmTradeFromVendor}
        playerInventory={playerSelling}
        vendorInventory={vendor.inventory}
        direction={confirmTradeDirection}
        onConfirm={onConfirmTrade}
        onCancel={onCancelTrade}
      />
    }
  </FlexCol>
}