import * as React from 'react';
import { useEffect, useState } from 'react';
import { FlexCol } from '@client/components/FlexCol';
import { NavBar } from '@client/components/NavBar';
import { Box, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import { playerCapsule } from '@client/capsules/player';
import { DEFAULT_ZONE, Zones } from '@shared/constants/zones';
import { Zone } from '@shared/types/game';
import { ZoneScreen } from '@overworld/components/ZoneScreen';

export const ZonePage = () => {
  const { zone: zoneID } = useParams();

  if (!zoneID) {
    const lastZone = playerCapsule.get('player')?.lastZone ?? DEFAULT_ZONE;
    window.location.href = `/play/zone/${lastZone}`;
    return <></>
  }

  const zone = Zones[zoneID] as Zone;

  if (!zone) {
    return <Box>
      <Typography>Zone not found</Typography>
    </Box>;
  }

  const [levels, setLevels] = useState<string[]>(null);

  useEffect(() => {
    playerCapsule.set('player', {
      ...playerCapsule.get('player'),
      lastZone: zoneID,
    });

    fetch(`/api/levels?zone=${zoneID}`)
      .then((res) => res.json())
      .then((levels) => {

        const zoneLevels = (levels as (string | number)[])
          .map(l => `${l}`)
          .filter(levelID => zone.levels.includes(levelID));

        setLevels(zoneLevels);
      });
  }, []);

  return <FlexCol sx={{ flexGrow: 1, height: '100vh', background: '#111' }}>
    <NavBar />
    {zone && levels ?
      <ZoneScreen
        zone={zone}
        levels={levels}
      />
      : <>
        <Typography>...Loading</Typography>
      </>
    }
  </FlexCol>
}