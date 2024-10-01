import expressSession from 'express-session';
import MongoStore from 'connect-mongo';
import Config from '@server/config';
import mongoose from '@server/lib/mongoose';

let session = null;

export const getSession = () => {
  if (!session) {
    session = expressSession({
      secret: Config.SESSION_SECRET,
      resave: true,
      saveUninitialized: true,
      store: new MongoStore({
        client: mongoose.connection.getClient(),
      }),
    });
  }
  return session;
}