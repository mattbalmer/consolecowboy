import * as React from 'react';
import { useMemo } from 'react';
import { FlexCol } from '@client/components/FlexCol';
import { Box, Button, Divider, Typography } from '@mui/material';
import { useOverworld } from '@overworld/hooks/use-overworld';
import { SimpleDialog } from '@client/components/SimpleDialog';
import { FlexRow } from '@client/components/FlexRow';
import { Tradeable, Vendor } from '@shared/types/game';
import { useCapsuleField } from '@client/hooks/use-capsule';
import { vendorsCapsule } from '@client/capsules/vendors';
import { Vendors } from '@shared/constants/vendors';
import { TradeManager } from '@overworld/components/TradeManager';
import { getTradeableValue } from '@shared/utils/game/tradeables';

export const TradeScreen = ({
  vendor: vendorInitial,
}: {
  vendor: Vendor,
}) => {
  const {
    player, setPlayer,
    dialog, setDialog,
  } = useOverworld('vendor');
  const [vendor, setVendor] = useCapsuleField(vendorsCapsule, vendorInitial.id as keyof typeof Vendors);
  const playerSelling = useMemo(() => {
    const selling: Tradeable[] = [];

    player.inventory.forEach((stack, i) => {
      selling.push({
        urn: `item:${stack.item}`,
        type: 'item',
        count: stack.count,
        price: {
          'item:money': getTradeableValue(`item:${stack.item}`, stack.count),
        },
      });
    });

    player.implants.forEach((implant, i) => {
      selling.push({
        urn: `implant:${implant}`,
        type: 'implant',
        count: 1,
        price: {
          'item:money': getTradeableValue(`implant:${implant}`),
        },
      });
    });

    selling.push({
      urn: `deck:${player.deck.id}`,
      type: 'deck',
      count: 1,
      price: {
        'item:money': getTradeableValue(`deck:${player.deck.id}`),
      },
    });

    Object.values(player.deck.programs).filter(program => !!program?.content).forEach((program, i) => {
      selling.push({
        urn: `program:${program.content}`,
        type: 'program',
        count: 1,
        price: {
          'item:money': getTradeableValue(`program:${program.content}`),
        },
      });
    });

    player.deck.scripts.forEach((script, i) => {
      selling.push({
        urn: `script:${script.id}`,
        type: 'script',
        count: 1,
        price: {
          'item:money': getTradeableValue(`script:${script.id}`, 1, script.props),
        },
        args: script.props,
      });
    });

    return selling;
  }, [player.inventory, player.implants, player.deck.id, player.deck.programs, player.deck.scripts]);

  const handleBuy = () => {

  }
  const handleSell = () => {

  }

  return <FlexCol sx={{ flexGrow: 1, p: 2 }}>
    <Typography variant={'h5'} sx={{ mb: 2 }}>Overworld &gt; Vendor &gt; {vendor.name}</Typography>
    <FlexRow sx={{ mb: 2 }}>
      <FlexCol sx={{ flexGrow: 0 }}>
        <Typography variant={'subtitle1'}>Actions</Typography>
        <Divider />
        <Button href={'/play'}>Back to Overworld</Button>
      </FlexCol>
    </FlexRow>
    <Box>
      <TradeManager
        playerSelling={playerSelling}
        buying={vendor.buying}
        selling={vendor.selling}
        onBuy={handleBuy}
        onSell={handleSell}
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
  </FlexCol>
}