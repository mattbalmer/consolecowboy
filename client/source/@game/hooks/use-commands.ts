import { Command, DebugCommand, Game } from '@shared/types/game';
import { useCallback, useState } from 'react';
import { CLIArgs } from '@shared/types/game/cli';
import { appendMessage, appendMessages, parseArgs } from '@shared/utils/game/cli';
import { LevelController } from '@game/level-controllers/base';
import { GameDerived } from '@shared/types/game';
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

  const onCommand = useCallback((game: Game, command: Command, commandArgs: CLIArgs): Game => {
    if (command === 'next') {
      return executeCommand('next', game, commandArgs, gameDerived)
    }

    if (command === 'config') {
      return executeCommand('config', game, commandArgs, gameDerived)
    }

    if (command === 'info') {
      return executeCommand('info', game, commandArgs, gameDerived)
    }

    if (command === 'inv') {
      return executeCommand('inv', game, commandArgs, gameDerived)
    }

    if (game.player.actions <= 0) {
      return appendMessage(game, {
        type: 'output',
        value: `No actions left`
      });
    }

    if (command === 'retreat') {
      return executeCommand('retreat', game, commandArgs, gameDerived)
    }

    if (command === 'break') {
      return executeCommand('break', game, commandArgs, gameDerived)
    }

    if (command === 'drill') {
      return executeCommand('drill', game, commandArgs, gameDerived)
    }

    if (command === 'move') {
      return executeCommand('move', game, commandArgs, gameDerived)
    }

    if (command === 'nav') {
      return executeCommand('nav', game, commandArgs, gameDerived)
    }

    // if ice active, disable other commands
    if (hoveredNode?.ice && hoveredNode.ice.status === 'ACTIVE') {
      return appendMessage(game, {
        type: 'output',
        value: `ICE is active - cannot execute`
      });
    }

    if (command === 'execute') {
      return executeCommand('execute', game, commandArgs, gameDerived);
    }

    return executeCommand(command, game, commandArgs, gameDerived);
  }, [game, gameDerived]);

  return useCallback((command: Command, ...rawArgs: string[]) => {
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
          setGame(controllerOutput.game);
          return;
        }
      }
    }

    try {
      let newGame = onCommand(game, command, commandArgs);

      if (!newGame) {
        setGame(game);
        return;
      }

      gameDerived = getGameDerived(newGame);
      newGame = runDaemons({
        game: newGame,
        derived: gameDerived,
        command,
        args: commandArgs,
      });

      if (game.player.config.autonext && newGame?.player.actions < 1) {
        newGame = onCommand(newGame, 'next', {_:[]} as CLIArgs);
        gameDerived = getGameDerived(newGame);

        newGame = runDaemons({
          game: newGame,
          derived: gameDerived,
          command,
          args: commandArgs,
        });
      }

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

  }, [game, gameDerived, onCommand, levelController])
}