import { CLIMessage } from '@shared/types/game';

type GameErrorTypes = Extract<CLIMessage['type'], 'error' | 'hidden'>
export class GameError extends Error {
  type: GameErrorTypes;

  constructor(message: CLIMessage['value'], type: GameErrorTypes = 'error') {
    super(message);
    this.type = type;
  }
}