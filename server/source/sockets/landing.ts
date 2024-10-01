import {
  SocketActionContext,
  SocketServer,
  SocketUser,
  User,
} from '@server/types';
import { createListener, emit, GetContextCallback, getOrCreateUser, Listener } from '@server/utils/sockets';
import { SocketActionParams, SocketActions } from '@shared/socket-actions';
import {
  createRoom,
  moveRoomToTeamSelectStage
} from '@server/actions/room';
import { session } from '@server/lib/session';
import sharedsession from 'express-socket.io-session';
import { updateNickname } from '@server/actions/user';

const getUserIdentifier = (user: User) => user?.name || user?._id || 'user';

const onEventListenerOptions = {
  log: true,
  logFunction: ({ event, data, context }) => {
    console.log(`socket action: ${event} (${getUserIdentifier(context.user)})`, data);
  },
};

export default function({ io }: { io: SocketServer }) {
  const roomIO = io.of('/home');

  roomIO.use(sharedsession(session));

  roomIO.on('connection', async (client) => {
    const initialUser: SocketUser = await getOrCreateUser(client);
    console.log('User joined homepage socket', initialUser);

    // if (!initialUser) {
    //   return;
    // }

    const createListenerWithContext = <C extends object>(getContext: GetContextCallback<SocketActionContext, C>): Listener<C> =>
      createListener<C>({
        client,
        namespace: roomIO,
        user: initialUser,
      }, getContext, onEventListenerOptions);

    const on = createListenerWithContext<{}>(async () => ({}));

    // Initial data load
    on<SocketActionParams.REQUEST_ROOM>(
      SocketActions.REQUEST_ROOM,
      async ({}, { client }) => {
        const initialRoom = await createRoom();
        const room = await moveRoomToTeamSelectStage(initialRoom.key);

        emit<SocketActionParams.ROOM_CREATED>(
          client,
          SocketActions.ROOM_CREATED,
          {
            room,
          }
        );
      }
    );

    on<SocketActionParams.UPDATE_NICKNAME>(
      SocketActions.UPDATE_NICKNAME,
      async ({ name }, { user }) => {
        const updatedUser = await updateNickname(user._id.toString(), name);

        emit<SocketActionParams.SELF_UPDATED>(
          client,
          SocketActions.SELF_UPDATED,
          {
            user: updatedUser,
          }
        );
      }
    );
  });
};