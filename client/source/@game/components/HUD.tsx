import { FlexCol } from '@client/components/FlexCol';
import { FlexRow } from '@client/components/FlexRow';
import { Typography } from '@mui/material';
import * as React from 'react';
import { Game, GameNode } from '@shared/types/game';
import { Dice } from '@client/components/Dice';

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
        <Typography variant={'h6'} sx={{ mr: 1 }}>{game.hovered}</Typography>
        <Typography variant={'subtitle1'}>({hoveredNode.x}, {hoveredNode.y})</Typography>
      </FlexRow>
      <FlexRow sx={{ alignItems: 'center' }}>
        <Typography variant={'subtitle1'}>ICE: {hoveredNode.ice ?
          <>{hoveredNode.ice.id} ({hoveredNode.ice.status.toLowerCase()})</>
          : '--'}</Typography>
      </FlexRow>
      <FlexRow sx={{ alignItems: 'center' }}>
        <Typography variant={'subtitle1'}>Content: {hoveredNode.content ?
          <>{hoveredNode.content.type} ({hoveredNode.content.status.toLowerCase()})</>
          : '--'}</Typography>
      </FlexRow>
    </FlexCol>
    <FlexCol>
      <FlexRow sx={{ alignItems: 'center' }}>
        <Typography variant={'h6'}>Round: {game.round}</Typography>
      </FlexRow>
      <FlexRow sx={{ alignItems: 'center' }}>
        <Typography variant={'subtitle1'}>Actions: {game.player.actions}</Typography>
      </FlexRow>
      <FlexRow sx={{ alignItems: 'center' }}>
        <Typography variant={'subtitle1'}>Mental: {game.player.mental}</Typography>
      </FlexRow>
      <FlexRow sx={{ alignItems: 'center' }}>
        <Typography variant={'subtitle1'} sx={{ ml: 2 }}>RAM: {game.player.ram.current} / {game.player.ram.max}</Typography>
      </FlexRow>
      <FlexRow sx={{ alignItems: 'center' }}>
        <Typography variant={'subtitle1'} sx={{ ml: 2 }}>Money: {game.player.money}</Typography>
      </FlexRow>
      <FlexRow sx={{ alignItems: 'center' }}>
        <Typography variant={'subtitle1'} sx={{ ml: 2 }}>ICEBreaker Power: {game.player.stats.icebreaker}</Typography>
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
    </FlexCol>
  </FlexRow>
}