import { Tradeable } from '@shared/types/game';
import { formatItemCount } from '@shared/utils/game/inventory';
import * as React from 'react';

export const TradeableCount = (props: ({
  tradeable: Tradeable,
} | {
  urn: Tradeable['urn'],
  count: Tradeable['count'],
})) => {
  const urn = 'tradeable' in props ? props.tradeable.urn : props.urn;
  const count = 'tradeable' in props ? props.tradeable.count : props.count;
  const [type, id] = urn.split(':') as [Tradeable['type'], string];

  return <>
    {count === -1 ? <>&infin;</> : type === 'item'
      ? formatItemCount(id, count)
      : `${count}`}
  </>
}