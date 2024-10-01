import {
  Role,
  Room, RoomID,
  RoomKey,
  RoomStage,
  SocketActionContext,
  SocketServer,
  SocketUser,
  User,
  UserID,
} from '@server/types';
import {
  createListener,
  emit,
  GetContextCallback,
  getOrCreateUser,
  getSocketSessionUserID,
  Listener
} from '@server/utils/sockets';
import { SocketActionParams, SocketActions } from '@shared/socket-actions';
import {
  addCustomWord,
  assignUserToRoom,
  createRoom,
  getRoomByKey,
  giveHintAndUpdateTurn,
  guessWord,
  holdPassTurn,
  holdWord,
  moveRoomToTeamSelectStage,
  passTurn, removeCustomWord,
  removeDisconnectedUsers,
  removeUserFromRoom, replaceCustomWord,
  setIsUsingCustomDeck,
  setRoomDeckAndMoveToPlaying,
  setRoomTeamAssignmentAndMoveToDeckSelect,
  tapWord,
  toggleDeckSelected,
  unholdPassTurn,
  unholdWord,
  updateCustomDeck,
  updateTeamPreference
} from '@server/actions/room';
import { session } from '@server/lib/session';
import sharedsession from 'express-socket.io-session';
import { getUserByID, updateNickname } from '@server/actions/user';
import { validatedGenerateTeamAssignments } from '@shared/utils/teams';
import { getUserRoleMap, isHintLegalValidated } from '@shared/utils/room';

const getUserIdentifier = (user: User) => user?.name || user?._id || 'user';

const onEventListenerOptions = {
  log: true,
  logFunction: ({ event, data, context }) => {
    console.log(`room socket action: ${event} (${getUserIdentifier(context.user)} | ${context?.roomID })`, data);
  },
};

const grabRoom = async (roomKey: RoomKey, userID: UserID, connectedUsers: UserID[]) => {
  const room = await getRoomByKey(roomKey);
  if (!room) {
    await createRoom(roomKey);
    await moveRoomToTeamSelectStage(roomKey);
  }
  if (room && room.stage === RoomStage.TEAM_SELECT) {
    await removeDisconnectedUsers(roomKey, connectedUsers);
  }
  await assignUserToRoom(roomKey, userID);
  return await getRoomByKey(roomKey);
}

const getRoomKey = (client) => {
  const roomKey = client?.handshake?.query['roomKey'] || '';
  return roomKey ? roomKey.toUpperCase() : null;
}

const ROOM_RESET_LOCK: Record<RoomID, boolean> = {
};

export default function({ io }: { io: SocketServer }) {
  const mainIO = io.of('/room');

  mainIO.use(sharedsession(session));

  mainIO.on('connection', async (client) => {
    const initialUser: SocketUser = await getOrCreateUser(client);
    const roomKey = getRoomKey(client);
    console.log('User joined room socket', initialUser);

    if (!initialUser || !roomKey) {
      return;
    }
    const userID = initialUser?._id.toString();

    const createListenerWithContext = <C extends object>(getContext: GetContextCallback<SocketActionContext, C>): Listener<C> =>
      createListener<C>({
        client,
        namespace: mainIO,
        user: initialUser,
      }, getContext, onEventListenerOptions);

    const on = createListenerWithContext<{
      roomKey: string,
      room: Room,
      user: User,
    }>(async () => ({
      roomKey,
      room: await getRoomByKey(roomKey),
      user: await getUserByID(initialUser._id),
    }));

    // Initial data load
    client.join(roomKey);
    const connectedUserIDs = Object.values(mainIO.connected).map(socket => getSocketSessionUserID(socket));
    let initialRoom = null
    try {
      initialRoom = await grabRoom(roomKey, initialUser._id, connectedUserIDs);
    } catch (err) {
      if (err.message === `FORBIDDEN_ROOM_KEY`) {
        emit<SocketActionParams.FORBIDDEN_ROOM_KEY>(
          client,
          SocketActions.FORBIDDEN_ROOM_KEY,
          {}
        );
      }
      return;
    }

    if (initialRoom.stage === RoomStage.PLAYING) {
      if ([initialRoom.teams.BLUE.CODEMASTER.toString(), initialRoom.teams.RED.CODEMASTER.toString()].includes(userID)) {
        console.log(`Having user ${userID} join codemasters room`);
        client.join(`${roomKey}:codemasters`);
      }
    }

    emit<SocketActionParams.SELF_CONNECTED>(
      client,
      SocketActions.SELF_CONNECTED,
      {
        room: initialRoom,
        user: initialUser,
      }
    );

    emit<SocketActionParams.ROOM_UPDATED>(
      mainIO.in(roomKey),
      SocketActions.ROOM_UPDATED,
      {
        room: initialRoom,
      }
    );

    on<SocketActionParams.UPDATE_NICKNAME>(
      SocketActions.UPDATE_NICKNAME,
      async ({ name }, { roomKey, user }) => {
        const updatedUser = await updateNickname(user._id.toString(), name);
        const room = await getRoomByKey(roomKey);

        emit<SocketActionParams.SELF_UPDATED>(
          client,
          SocketActions.SELF_UPDATED,
          {
            user: updatedUser,
          }
        );
        emit<SocketActionParams.ROOM_UPDATED>(
          mainIO.in(roomKey),
          SocketActions.ROOM_UPDATED,
          {
            room,
          }
        );
      }
    );

    on<SocketActionParams.SELECT_DECK>(
      SocketActions.SELECT_DECK,
      async ({ deckID }, { roomKey, client }) => {
        const room = await toggleDeckSelected(roomKey, deckID);

        emit<SocketActionParams.ROOM_UPDATED>(
          mainIO.in(roomKey),
          SocketActions.ROOM_UPDATED,
          {
            room,
          }
        );
      }
    );

    on<SocketActionParams.CHANGE_IS_USING_CUSTOM_DECK>(
      SocketActions.CHANGE_IS_USING_CUSTOM_DECK,
      async ({ isUsingCustom }, { roomKey, client }) => {
        const room = await setIsUsingCustomDeck(roomKey, isUsingCustom);

        emit<SocketActionParams.ROOM_UPDATED>(
          mainIO.in(roomKey),
          SocketActions.ROOM_UPDATED,
          {
            room,
          }
        );
      }
    );

    on<SocketActionParams.UPDATE_CUSTOM_DECK>(
      SocketActions.UPDATE_CUSTOM_DECK,
      async ({ name, words }, { roomKey, client }) => {
        const room = await updateCustomDeck(roomKey, { name, words });

        emit<SocketActionParams.ROOM_UPDATED>(
          mainIO.in(roomKey),
          SocketActions.ROOM_UPDATED,
          {
            room,
          }
        );
      }
    );

    on<SocketActionParams.ADD_CUSTOM_WORD>(
      SocketActions.ADD_CUSTOM_WORD,
      async ({ word }, { roomKey, client }) => {
        const room = await addCustomWord(roomKey, word);

        emit<SocketActionParams.ROOM_UPDATED>(
          mainIO.in(roomKey),
          SocketActions.ROOM_UPDATED,
          {
            room,
          }
        );
      }
    );

    on<SocketActionParams.REMOVE_CUSTOM_WORD>(
      SocketActions.REMOVE_CUSTOM_WORD,
      async ({ word }, { roomKey, client }) => {
        const room = await removeCustomWord(roomKey, word);

        emit<SocketActionParams.ROOM_UPDATED>(
          mainIO.in(roomKey),
          SocketActions.ROOM_UPDATED,
          {
            room,
          }
        );
      }
    );

    on<SocketActionParams.REPLACE_CUSTOM_WORD>(
      SocketActions.REPLACE_CUSTOM_WORD,
      async ({ oldWord, newWord }, { roomKey, client }) => {
        const room = await replaceCustomWord(roomKey, oldWord, newWord);

        emit<SocketActionParams.ROOM_UPDATED>(
          mainIO.in(roomKey),
          SocketActions.ROOM_UPDATED,
          {
            room,
          }
        );
      }
    );

    on<SocketActionParams.CONFIRM_DECK_SELECTION>(
      SocketActions.CONFIRM_DECK_SELECTION,
      async ({ }, { roomKey, client }) => {
        const connectedUserIDs = Object.values(mainIO.connected).map(socket => getSocketSessionUserID(socket));
        const room = await setRoomDeckAndMoveToPlaying(roomKey, connectedUserIDs);

        await removeDisconnectedUsers(roomKey, connectedUserIDs);

        emit<SocketActionParams.ROOM_UPDATED>(
          mainIO.in(roomKey),
          SocketActions.ROOM_UPDATED,
          {
            room,
          }
        );
      }
    );

    on<SocketActionParams.CHANGE_TEAM_PREFERENCE>(
      SocketActions.CHANGE_TEAM_PREFERENCE,
      async ({ userID, preference }, { roomKey, client, user }) => {
        if (!user._id || user._id.toString() !== userID.toString()) {
          console.log(`User ${user._id.toString()} cannot modify team preference for user ${userID}`);
          return;
        }
        const room = await updateTeamPreference(roomKey, userID, preference);

        emit<SocketActionParams.ROOM_UPDATED>(
          mainIO.in(roomKey),
          SocketActions.ROOM_UPDATED,
          {
            room,
          }
        );
      }
    );

    on<SocketActionParams.CONFIRM_TEAMS>(
      SocketActions.CONFIRM_TEAMS,
      async ({}, { roomKey, room, client, user }) => {
        if (ROOM_RESET_LOCK[roomKey]) {
          console.log(`Cannot confirm teams: room is currently being reset`);
          return;
        }

        const userPreferences = room.stageData.TEAM_SELECT.preferences;
        const currentUserPreferences = room.users.reduce((preferences, user) => {
          return {
            ...preferences,
            // @ts-ignore
            [user._id.toString()]: userPreferences.get(user._id.toString()),
          }
        }, {});
        const teamAssignment = validatedGenerateTeamAssignments(currentUserPreferences);

        if (!teamAssignment.value || teamAssignment.errors.length > 0) {
          console.log(`Team cannot be generated`, roomKey);
          return;
        }

        Object.values(mainIO.connected).forEach(socket => {
          const socketUserID = getSocketSessionUserID(socket);
          if ([teamAssignment.value.BLUE.CODEMASTER.toString(), teamAssignment.value.RED.CODEMASTER.toString()].includes(socketUserID.toString())) {
            console.log(`Having user ${socketUserID} join codemasters room`);
            socket.join(`${roomKey}:codemasters`);
          }
        });

        const updatedRoom = await setRoomTeamAssignmentAndMoveToDeckSelect(roomKey, teamAssignment.value);

        emit<SocketActionParams.ROOM_UPDATED>(
          mainIO.in(roomKey),
          SocketActions.ROOM_UPDATED,
          {
            room: updatedRoom,
          }
        );
      }
    );

    on<SocketActionParams.GIVE_HINT>(
      SocketActions.GIVE_HINT,
      async ({ hint }, { roomKey, room, client, user }) => {
        if (room.stage !== RoomStage.PLAYING) {
          console.log(`Cannot create hint except while playing.`);
          return;
        }
        const roleMap = getUserRoleMap(room);
        const userRoles = roleMap[user._id.toString()];

        if (!userRoles || userRoles.role !== room.stageData.PLAYING.turn.role || userRoles.team !== room.stageData.PLAYING.turn.team) {
          console.log(`Cannot create hint as it is not your turn.`);
          return;
        }

        if (room.stageData.PLAYING.turn.role !== Role.CODEMASTER) {
          console.log(`Cannot create hint as guesser.`);
          return;
        }

        const validateLegality = isHintLegalValidated(room, hint);

        if (validateLegality.value !== true) {
          console.log(`Hint is invalid`, validateLegality.errors);
          return;
        }

        const updatedRoom = await giveHintAndUpdateTurn(roomKey, userRoles.team, user, hint);

        emit<SocketActionParams.ROOM_UPDATED>(
          mainIO.in(roomKey),
          SocketActions.ROOM_UPDATED,
          {
            room: updatedRoom,
          }
        );
      }
    );

    on<SocketActionParams.UPDATE_TEMP_HINT>(
      SocketActions.UPDATE_TEMP_HINT,
      async ({ hint }, { roomKey, room, client, user }) => {
        if (room.stage !== RoomStage.PLAYING) {
          console.log(`Cannot create hint except while playing.`);
          return;
        }
        const roleMap = getUserRoleMap(room);
        const userRoles = roleMap[user._id.toString()];

        if (!userRoles || userRoles.role !== room.stageData.PLAYING.turn.role || userRoles.team !== room.stageData.PLAYING.turn.team) {
          console.log(`Cannot create hint as it is not your turn.`);
          return;
        }

        if (room.stageData.PLAYING.turn.role !== Role.CODEMASTER) {
          console.log(`Cannot create hint as guesser.`);
          return;
        }

        emit<SocketActionParams.HINT_UPDATED>(
          mainIO.in(`${roomKey}:codemasters`),
          SocketActions.HINT_UPDATED,
          {
            hint,
          }
        );
      }
    );

    on<SocketActionParams.TAP_WORD>(
      SocketActions.TAP_WORD,
      async ({ word }, { roomKey, room, client, user }) => {
        if (room.stage !== RoomStage.PLAYING) {
          console.log(`Cannot tap word except while playing.`);
          return;
        }
        const roleMap = getUserRoleMap(room);
        const userRoles = roleMap[user._id.toString()];

        if (!userRoles || userRoles.role !== room.stageData.PLAYING.turn.role || userRoles.team !== room.stageData.PLAYING.turn.team) {
          console.log(`Cannot tap word as it is not your turn.`);
          return;
        }

        if (room.stageData.PLAYING.turn.role !== Role.GUESSER) {
          console.log(`Cannot tap word as codemaster.`);
          return;
        }

        const updatedRoom = await tapWord(roomKey, word);

        emit<SocketActionParams.ROOM_UPDATED>(
          mainIO.in(roomKey),
          SocketActions.ROOM_UPDATED,
          {
            room: updatedRoom,
          }
        );
      }
    );

    on<SocketActionParams.HOLD_WORD>(
      SocketActions.HOLD_WORD,
      async ({ word, holdStart }, { roomKey, room, client, user }) => {
        if (room.stage !== RoomStage.PLAYING) {
          console.log(`Cannot hold word except while playing.`);
          return;
        }
        const roleMap = getUserRoleMap(room);
        const userRoles = roleMap[user._id.toString()];

        if (!userRoles || userRoles.role !== room.stageData.PLAYING.turn.role || userRoles.team !== room.stageData.PLAYING.turn.team) {
          console.log(`Cannot hold word as it is not your turn.`);
          return;
        }

        if (room.stageData.PLAYING.turn.role !== Role.GUESSER) {
          console.log(`Cannot hold word as codemaster.`);
          return;
        }

        const updatedRoom = await holdWord(roomKey, { word, holdStart });

        emit<SocketActionParams.ROOM_UPDATED>(
          mainIO.in(roomKey),
          SocketActions.ROOM_UPDATED,
          {
            room: updatedRoom,
          }
        );
      }
    );

    on<SocketActionParams.UNHOLD_WORD>(
      SocketActions.UNHOLD_WORD,
      async ({ word }, { roomKey, room, client, user }) => {
        if (room.stage !== RoomStage.PLAYING) {
          console.log(`Cannot unhold word except while playing.`);
          return;
        }
        const roleMap = getUserRoleMap(room);
        const userRoles = roleMap[user._id.toString()];

        if (!userRoles || userRoles.role !== room.stageData.PLAYING.turn.role || userRoles.team !== room.stageData.PLAYING.turn.team) {
          console.log(`Cannot unhold word as it is not your turn.`);
          return;
        }

        if (room.stageData.PLAYING.turn.role !== Role.GUESSER) {
          console.log(`Cannot unhold word as codemaster.`);
          return;
        }

        const updatedRoom = await unholdWord(roomKey, word);

        emit<SocketActionParams.ROOM_UPDATED>(
          mainIO.in(roomKey),
          SocketActions.ROOM_UPDATED,
          {
            room: updatedRoom,
          }
        );
      }
    );

    on<SocketActionParams.CONFIRM_GUESS>(
      SocketActions.CONFIRM_GUESS,
      async ({ word }, { roomKey, room, client, user }) => {
        if (ROOM_RESET_LOCK[roomKey]) {
          console.log(`Cannot confirm word: room is currently being reset`);
          return;
        }
        if (room.stage !== RoomStage.PLAYING) {
          console.log(`Cannot confirm word except while playing.`);
          return;
        }
        const roleMap = getUserRoleMap(room);
        const userRoles = roleMap[user._id.toString()];

        if (!userRoles || userRoles.role !== room.stageData.PLAYING.turn.role || userRoles.team !== room.stageData.PLAYING.turn.team) {
          console.log(`Cannot confirm word as it is not your turn.`);
          return;
        }

        if (room.stageData.PLAYING.turn.role !== Role.GUESSER) {
          console.log(`Cannot confirm word as codemaster.`);
          return;
        }

        const updatedRoom = await guessWord(roomKey, word, userRoles.team, user);

        emit<SocketActionParams.ROOM_UPDATED>(
          mainIO.in(roomKey),
          SocketActions.ROOM_UPDATED,
          {
            room: updatedRoom,
          }
        );
      }
    );

    on<SocketActionParams.HOLD_PASS>(
      SocketActions.HOLD_PASS,
      async ({ holdStart }, { roomKey, room, client, user }) => {
        if (room.stage !== RoomStage.PLAYING) {
          console.log(`Cannot indicate pass turn except while playing.`);
          return;
        }
        const roleMap = getUserRoleMap(room);
        const userRoles = roleMap[user._id.toString()];

        if (!userRoles || userRoles.role !== room.stageData.PLAYING.turn.role || userRoles.team !== room.stageData.PLAYING.turn.team) {
          console.log(`Cannot indicate pass turn as it is not your turn.`);
          return;
        }

        if (room.stageData.PLAYING.turn.role !== Role.GUESSER) {
          console.log(`Cannot indicate pass turn as codemaster.`);
          return;
        }

        const updatedRoom = await holdPassTurn(roomKey, holdStart);

        emit<SocketActionParams.ROOM_UPDATED>(
          mainIO.in(roomKey),
          SocketActions.ROOM_UPDATED,
          {
            room: updatedRoom,
          }
        );
      }
    );

    on<SocketActionParams.UNHOLD_PASS>(
      SocketActions.UNHOLD_PASS,
      async ({ }, { roomKey, room, client, user }) => {
        if (room.stage !== RoomStage.PLAYING) {
          console.log(`Cannot de-indicate pass turn except while playing.`);
          return;
        }
        const roleMap = getUserRoleMap(room);
        const userRoles = roleMap[user._id.toString()];

        if (!userRoles || userRoles.role !== room.stageData.PLAYING.turn.role || userRoles.team !== room.stageData.PLAYING.turn.team) {
          console.log(`Cannot de-indicate pass turn as it is not your turn.`);
          return;
        }

        if (room.stageData.PLAYING.turn.role !== Role.GUESSER) {
          console.log(`Cannot de-indicate pass turn as codemaster.`);
          return;
        }

        const updatedRoom = await unholdPassTurn(roomKey);

        emit<SocketActionParams.ROOM_UPDATED>(
          mainIO.in(roomKey),
          SocketActions.ROOM_UPDATED,
          {
            room: updatedRoom,
          }
        );
      }
    );

    on<SocketActionParams.CONFIRM_PASS>(
      SocketActions.CONFIRM_PASS,
      async ({ }, { roomKey, room, client, user }) => {
        if (room.stage !== RoomStage.PLAYING) {
          console.log(`Cannot pass turn except while playing.`);
          return;
        }
        const roleMap = getUserRoleMap(room);
        const userRoles = roleMap[user._id.toString()];

        if (!userRoles || userRoles.role !== room.stageData.PLAYING.turn.role || userRoles.team !== room.stageData.PLAYING.turn.team) {
          console.log(`Cannot pass turn as it is not your turn.`);
          return;
        }

        if (room.stageData.PLAYING.turn.role !== Role.GUESSER) {
          console.log(`Cannot pass turn as codemaster.`);
          return;
        }

        const updatedRoom = await passTurn(roomKey, userRoles.team, user);

        emit<SocketActionParams.ROOM_UPDATED>(
          mainIO.in(roomKey),
          SocketActions.ROOM_UPDATED,
          {
            room: updatedRoom,
          }
        );
      }
    );

    on<SocketActionParams.RESET_ROOM>(
      SocketActions.RESET_ROOM,
      async ({ }, { roomKey, room, client, user }) => {
        ROOM_RESET_LOCK[roomKey] = true;

        const updatedRoom = await moveRoomToTeamSelectStage(roomKey);

        ROOM_RESET_LOCK[roomKey] = false;

        emit<SocketActionParams.ROOM_UPDATED>(
          mainIO.in(roomKey),
          SocketActions.ROOM_UPDATED,
          {
            room: updatedRoom,
          }
        );
      }
    );

    client.on('disconnect', async () => {
      console.log(`User left nexus socket`, initialUser);

      const room = await removeUserFromRoom(roomKey, initialUser._id);

      emit<SocketActionParams.ROOM_UPDATED>(
        client.to(roomKey),
        SocketActions.ROOM_UPDATED,
        {
          room,
        }
      );
    });
  });
};