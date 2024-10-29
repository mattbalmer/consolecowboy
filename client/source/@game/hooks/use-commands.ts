import { CoreCommand, DebugCommand, Game, GameDerived } from '@shared/types/game';
import { useCallback, useState } from 'react';
import { CLIArgs } from '@shared/types/game/cli';
import { appendMessage, appendMessages, parseArgs } from '@shared/utils/game/cli';
import { LevelController } from '@game/level-controllers/base';
import { executeCommand } from '@shared/constants/commands';
import { executeDebugCommand } from '@shared/constants/debug-commands';
import { getGameDerived } from '@shared/utils/game';
import { getAutoDice } from '@shared/utils/game/dice';
import { GameError } from '@shared/errors/GameError';
import { runDaemons } from '@shared/utils/game/daemons';

export const useCommands = ({
  game,
  setGame,
  gameDerived,
  levelController,
}: {
  game: Game,
  setGame: ReturnType<typeof useState<Game>>[1],
  gameDerived: GameDerived,
  levelController: LevelController,
}) => {
  const { hoveredNode, nodeMap } = gameDerived;
  // let game = rfdc(gameSource);

  // to fix: immutable

  return useCallback((command: CoreCommand, ...rawArgs: string[]) => {
    console.debug('oNCommand', command);
    // @ts-ignore
    if (window['DEBUG_COMMANDS_ENABLED'] && command === 'dbg') {
      const debugCommand = rawArgs[0] as DebugCommand;
      let commandArgs = parseArgs(rawArgs.slice(1));

      game = appendMessage(game, {
        type: 'command',
        value: `dbg ${debugCommand} ${rawArgs.slice(1).join(' ')}`
      });

      game = executeDebugCommand(debugCommand, game, commandArgs, gameDerived);
      gameDerived = getGameDerived(game);

      // f = freeze
      if (commandArgs.f) {
        setGame(game);
        return;
      }

      game = runDaemons({
        game,
        derived: gameDerived,
        command,
        args: commandArgs,
      });

      game.currentAction += game.actionsToIncrement;
      game.actionsToIncrement = 0;
      setGame(game);
      return;
    }

    if (game.mode === 'VIEW') {
      console.log('cannot issue commands in view mode');
      return;
    }

    let commandArgs = parseArgs(rawArgs);

    // Auto use a dice
    if (!commandArgs.d) {
      commandArgs.d = [getAutoDice(game)];
    }

    game = appendMessage(game, {
      type: 'command',
      value: `${command} ${rawArgs.join(' ')}`
    });

    if (levelController) {
      const controllerOutput = levelController.onCommand(game, command, commandArgs);
      if (controllerOutput) {
        if (controllerOutput.shouldContinue) {
          game = controllerOutput.game ?? game;
          command = controllerOutput.command ?? command;
          commandArgs = controllerOutput.args ?? commandArgs;
          gameDerived = getGameDerived(game);
        } else {
          controllerOutput.game.currentAction += controllerOutput.game.actionsToIncrement;
          controllerOutput.game.actionsToIncrement = 0;
          setGame(controllerOutput.game);
          return;
        }
      }
    }

    try {
      // now the siphon daemon is running on the same command it was instantiated with.
      let newGame = executeCommand(command, game, commandArgs, gameDerived);
      gameDerived = getGameDerived(newGame);

      newGame = runDaemons({
        game: newGame,
        derived: gameDerived,
        command,
        args: commandArgs,
      });

      if (game.player.config.autonext && newGame?.player.actions < 1) {
        newGame = executeCommand('next', newGame, {_:[]} as CLIArgs, gameDerived);
        gameDerived = getGameDerived(newGame);

        newGame = runDaemons({
          game: newGame,
          derived: gameDerived,
          command,
          args: commandArgs,
        });
      }

      newGame.currentAction += newGame.actionsToIncrement;
      newGame.actionsToIncrement = 0;
      setGame(newGame);
    } catch (error) {
      if (error instanceof GameError) {
        console.error(error);
        game = appendMessages(game, error.messages);
        setGame(game);
      } else {
        throw error;
      }
    }

  }, [game, gameDerived, levelController])
}