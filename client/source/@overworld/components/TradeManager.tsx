import * as React from 'react';
import { useState } from 'react';
import { Tradeable } from '@shared/types/game';
import { Box, Divider, Tab, Typography } from '@mui/material';
import { FlexCol } from '@client/components/FlexCol';
import { FlexRow } from '@client/components/FlexRow';
import { formatStackCount } from '@shared/utils/game/inventory';
import { TabContext, TabList, TabPanel } from '@mui/lab';

export const TradeableStack = ({ tradeable }: {
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

export const TradeManager = ({
  playerSelling,
  buying,
  selling,
  onBuy,
  onSell,
}: {
  playerSelling: Tradeable[],
  buying: Tradeable[],
  selling: Tradeable[],
  onBuy: (tradeable: Tradeable) => void,
  onSell: (tradeable: Tradeable) => void,
}) => {
  const [tab, setTab] = useState<'buying' | 'selling'>('buying');

  const handleTabChange = (event: React.SyntheticEvent, newValue: 'buying' | 'selling') => {
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
            <Tab label='Selling' value='selling' />
            <Tab label='Buying' value='buying' />
          </TabList>
        </Box>
        <TabPanel value='buying'>
          <Divider />
          <FlexRow sx={{ flexWrap: 'wrap' }}>
            {buying.map((tradeable, i) => {
              return <Box key={i} sx={{ m: 1 }}>
                <TradeableStack tradeable={tradeable} />
              </Box>
            })}
          </FlexRow>
        </TabPanel>
        <TabPanel value='selling'>
          <Divider />
          <FlexRow sx={{ flexWrap: 'wrap' }}>
            {selling.map((tradeable, i) => {
              return <Box key={i} sx={{ m: 1 }}>
                <TradeableStack tradeable={tradeable} />
              </Box>
            })}
          </FlexRow>
        </TabPanel>
      </TabContext>
    </FlexCol>
  </FlexRow>
}