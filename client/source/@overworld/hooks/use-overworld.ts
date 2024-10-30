import { useCapsuleField } from '@client/hooks/use-capsule';
import { playerCapsule } from '@client/capsules/player';
import { useState } from 'react';
import { transitionsCapsule } from '@client/capsules/transitions';
import { Zone } from '@shared/types/game';
import { OverworldPage } from '@overworld/types';
import { useOverworldController } from '@overworld/controllers';

export type OverworldState = ReturnType<typeof useOverworld>;

export const useOverworld = (page: OverworldPage, zone?: Zone['id']) => {
  const [player, setPlayer] = useCapsuleField(playerCapsule, 'player');
  const [extraction, setExtraction] = useCapsuleField(transitionsCapsule, 'extraction');
  const [dialog, setDialog] = useState<{
    title: string,
    body: string,
    acknowledge: string,
    onFinish: () => void,
  }>(null);
  const [misc, setMisc] = useState({
    hasShownIntroDialog: false,
    hasShownDeadDialog: false,
    hasShownFeedbackDialog: false,
  });

  const state = {
    player, setPlayer,
    extraction, setExtraction,
    dialog, setDialog,
    misc, setMisc,
  };

  if (page === 'overworld') {
    const controller = useOverworldController(page, zone, state);
  }

  return state;
}