import { playerCapsule } from '@client/capsules/player';
import { DEFAULT_ZONE } from '@shared/constants/zones';
import { Player } from '@shared/types/game';

export const overworldURL = (player?: Player) => {
  const p = player ?? playerCapsule.get('player');
  const zone = p?.lastZone ?? DEFAULT_ZONE;
  return `/play/zone/${zone}`;
}