import { FlexCol } from '@client/components/FlexCol';
import { FlexRow } from '@client/components/FlexRow';
import { Typography } from '@mui/material';
import * as React from 'react';
import { Game, GameNode } from '@shared/types/game';
import { Dice } from '@client/components/Dice';
import { itemCountFormatted } from '@shared/utils/game/player';

export const HUD = ({
  game,
  hoveredNode,
}: {
  game: Game,
  hoveredNode: GameNode,
}) => {
  return <FlexRow data-header sx={{ p: 2, justifyContent: 'space-between' }}>
    <FlexCol>
      <FlexRow sx={{ alignItems: 'center' }}>
        <Typography variant={'h6'} sx={{ mr: 1 }}>{game.player.node}</Typography>
        <Typography variant={'subtitle1'}>({hoveredNode.x}, {hoveredNode.y})</Typography>
      </FlexRow>
      <FlexRow sx={{ alignItems: 'center' }}>
        <Typography variant={'subtitle1'}>ICE: {hoveredNode.ice ?
          <>{hoveredNode.ice.id} ({hoveredNode.ice.status.toLowerCase()})</>
          : '--'}</Typography>
      </FlexRow>
      <FlexRow sx={{ alignItems: 'center' }}>
        <Typography variant={'subtitle1'}>Content: {hoveredNode.content ?
          <>({hoveredNode.content.status.toLowerCase()})</>
          : '--'}</Typography>
      </FlexRow>
    </FlexCol>
    <FlexCol>
      <FlexRow sx={{ alignItems: 'center' }}>
        <Typography variant={'h6'}>Round: {game.round}</Typography>
      </FlexRow>
      <FlexRow>
        {game.player.dice.map((dice, i) => {
          return <Dice
            key={i}
            value={dice.value}
            isAvailable={dice.isAvailable}
          />
        })}
      </FlexRow>
      <FlexRow sx={{ alignItems: 'center' }}>
        <Typography variant={'subtitle1'}>Mental: {game.player.mental}</Typography>
      </FlexRow>
      <FlexRow sx={{ alignItems: 'center' }}>
        <Typography variant={'subtitle1'} sx={{ ml: 0 }}>RAM: {game.player.ram.current} / {game.player.ram.max}</Typography>
      </FlexRow>
      <FlexRow sx={{ alignItems: 'center' }}>
        <Typography variant={'subtitle1'} sx={{ ml: 0 }}>Money: {itemCountFormatted(game.player, 'Money')}</Typography>
      </FlexRow>
      <FlexCol sx={{ alignItems: 'center' }}>
        <Typography variant={'subtitle1'} sx={{ ml: 0 }}>Icebreaker: {game.player.stats.icebreaker.barrier}/{game.player.stats.icebreaker.sentry}/{game.player.stats.icebreaker.codegate}</Typography>
      </FlexCol>
      <FlexCol sx={{ alignItems: 'center' }}>
        <Typography variant={'subtitle1'} sx={{ ml: 0 }}>Recon: {game.player.stats.recon.info}</Typography>
      </FlexCol>
    </FlexCol>
  </FlexRow>
}