import * as React from 'react';
import { useMemo, useState } from 'react';
import { Tradeable, Vendor } from '@shared/types/game';
import { Box, Divider, Tab, Typography } from '@mui/material';
import { FlexCol } from '@client/components/FlexCol';
import { FlexRow } from '@client/components/FlexRow';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { TradeableStack } from '@overworld/components/TradeableStack';

export const TradeManager = ({
  playerSelling,
  vendor,
  onPlayerBuy,
  onPlayerSell,
}: {
  playerSelling: Tradeable[],
  vendor: Vendor,
  onPlayerBuy: (tradeable: Tradeable) => void,
  onPlayerSell: (tradeable: Tradeable) => void,
}) => {
  const [tab, setTab] = useState<'buy' | 'sell'>('buy');

  const vendorBuying = useMemo(() => {
    return vendor.buying.map(tradeable => {
      const countOwned = vendor.inventory.find(t => t.urn === tradeable.urn)?.count ?? 0;
      return {
        ...tradeable,
        count: tradeable.count === -1 ? countOwned : tradeable.count - countOwned,
      }
    });
  }, [vendor.buying, vendor.inventory]);

  const vendorSelling = useMemo(() => {
    return vendor.inventory.map(tradeable => {
      const tradeableSelling = vendor.selling.find(t => t.urn === tradeable.urn);
      const countWillSell = tradeableSelling?.count ?? 0;
      return {
        ...tradeable,
        count: countWillSell === -1 ? tradeable.count : tradeable.count - countWillSell,
      }
    });
  }, [vendor.selling, vendor.inventory]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: 'buy' | 'sell') => {
    setTab(newValue);
  };

  return <FlexRow>
    <FlexCol>
      <Typography variant={'subtitle1'}>Your HD</Typography>
      <Divider />
      <FlexRow sx={{ flexWrap: 'wrap' }}>
        {playerSelling.map((tradeable, i) => {
          return <Box key={i} sx={{ m: 1 }}>
            <TradeableStack tradeable={tradeable} />
          </Box>
        })}
      </FlexRow>
    </FlexCol>
    <FlexCol>
      <TabContext value={tab}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <TabList onChange={handleTabChange} aria-label='vendor-tradeables'>
            <Tab label='Buy' value='buy' />
            <Tab label='Sell' value='sell' />
          </TabList>
        </Box>
        <TabPanel value='buy'>
          <Divider />
          <FlexRow sx={{ flexWrap: 'wrap' }}>
            {vendorSelling.map((tradeable, i) => {
              return <Box key={i} sx={{ m: 1 }} onClick={() => onPlayerBuy(tradeable)}>
                <TradeableStack tradeable={tradeable} />
              </Box>
            })}
          </FlexRow>
        </TabPanel>
        <TabPanel value='sell'>
          <Divider />
          <FlexRow sx={{ flexWrap: 'wrap' }}>
            {vendorBuying.map((tradeable, i) => {
              return <Box key={i} sx={{ m: 1 }} onClick={() => onPlayerSell(tradeable)}>
                <TradeableStack tradeable={tradeable} />
              </Box>
            })}
          </FlexRow>
        </TabPanel>
      </TabContext>
    </FlexCol>
  </FlexRow>
}