import { Game, NodeContent } from '@shared/types/game';
import { GameError } from '@shared/errors/GameError';

export const canExecute = (content: NodeContent, game: Game): boolean => {
  return content ?
    content?.canExecute ? content.canExecute(game) : content.executionCount < 1
  : false;
}

export const executeContent = (content: NodeContent, game: Game): Game => {
  if (!content) {
    throw new GameError('No content to execute');
  }

  if (!canExecute(content, game)) {
    throw new GameError('Content cannot be executed');
  }

  game = content.onExecute(game) ?? game;
  content.executionCount++;

  return game;
}