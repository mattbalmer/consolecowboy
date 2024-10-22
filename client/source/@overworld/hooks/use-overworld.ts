import { useCapsuleField } from '@client/hooks/use-capsule';
import { playerCapsule } from '@client/capsules/player';
import { useMemo, useState } from 'react';
import { useOverworldController } from '@overworld/controller';

export type OverworldState = ReturnType<typeof useOverworld>;

export const useOverworld = () => {
  const [player, setPlayer] = useCapsuleField(playerCapsule, 'player');
  const [dialog, setDialog] = useState<{
    title: string,
    body: string,
    acknowledge: string,
    onFinish: () => void,
  }>(null);
  const [misc, setMisc] = useState({
    hasShownIntroDialog: false,
    hasShownDeadDialog: false,
  });

  const state = {
    player, setPlayer,
    dialog, setDialog,
    misc, setMisc,
  };

  const controller = useOverworldController(state);

  return state;
}