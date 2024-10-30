import { Tradeable, TradeableURN } from '@shared/types/game';
import { Items } from '@shared/constants/items';
import { Decks } from '@shared/constants/decks';
import { Implants } from '@shared/constants/implants';
import { Programs } from '@shared/constants/programs';
import { Scripts } from '@shared/constants/scripts';

export const getTradeableValue = (urn: TradeableURN, count: number = 1, args: Tradeable['args'] = undefined): number => {
  const [type, id] = urn.split(':') as [Tradeable['type'], string];
  if (type === 'item') {
    return Items[id].value * count;
  }
  if (type === 'deck') {
    return Decks[id]?.().value * count;
  }
  if (type === 'implant') {
    return Implants[id]?.().value * count;
  }
  if (type === 'program') {
    return Programs[id]?.().value * count;
  }
  if (type === 'script') {
    return Scripts[id]?.(args).value * count;
  }
}