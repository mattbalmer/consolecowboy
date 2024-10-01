import { Socket, Namespace, Server } from 'socket.io';
import { User } from '@shared/types/users';

export type SocketServer = Server;
export type SocketClient = Socket;
export type SocketNamespace = Namespace;
export type SocketUser = User & {};

export type SocketActionContext = {
  client: SocketClient,
  namespace: SocketNamespace,
  user: SocketUser,
}

export interface SocketActionCallback<D extends object = object, C extends object = {}> {
  (data: D, context: SocketActionContext & C, event: string): void | boolean | Promise<void|boolean>
}
