import { CLIMessage } from '@shared/types/game';

type GameErrorTypes = Extract<CLIMessage['type'], 'error' | 'hidden'>
export class GameError extends Error {
  type: GameErrorTypes;
  messageList: CLIMessage['value'][];

  constructor(message: CLIMessage['value'] | CLIMessage['value'][], type: GameErrorTypes = 'error') {
    super(Array.isArray(message) ? message.join('\n') : message);
    this.type = type;
    this.messageList = Array.isArray(message) ? message : [message];
  }

  get messages(): CLIMessage[] {
    return this.messageList.map(value => ({ type: this.type, value }));
  }
}