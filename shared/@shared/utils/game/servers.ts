import { EntityURN, Game, NodeID } from '@shared/types/game';
import { GameError } from '@shared/errors/GameError';

export const canExecute = (game: Game, node: NodeID, actor: EntityURN, benefactor?: EntityURN): boolean => {
  const content = game.nodes[node]?.content;
  return content ?
    content?.canExecute ? content.canExecute(game, actor, node, benefactor) : content.executionCount < 1
  : false;
}

export const executeContent = (game: Game, node: NodeID, actor: EntityURN, benefactor?: EntityURN): Game => {
  const content = game.nodes[node]?.content;

  if (!content) {
    throw new GameError('No content to execute');
  }

  if (!canExecute(game, node, actor)) {
    throw new GameError('Content cannot be executed');
  }

  console.debug('executeContent', actor, benefactor, node, game);

  game = content.onExecute(game, actor, node, benefactor);
  if (!game) {
    throw new Error(`Server content at ${node} failed to update game state (initiated by ${actor})`);
  }

  content.executionCount++;

  return game;
}