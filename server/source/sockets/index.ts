import initHome from './landing';
import initRoom from './room';
import type { Server } from 'socket.io';

export const initSockets = ({ io }: { io: Server }) => {
  initHome({ io });
  initRoom({ io });
};