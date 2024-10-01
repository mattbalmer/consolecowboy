import * as http from 'node:http';
import Config from 'config';
import * as path from 'path';
import express from 'express';
import * as exphbs from 'express-handlebars';
import morgan from 'morgan';
import initPassport from '@server/lib/passport';
import { getSession } from '@server/lib/session';
import { Server } from 'socket.io';
// import { initSockets } from '@server/sockets';

let expressServer = null;

export const getOrCreateServer = () => {
  if (!expressServer) {
    expressServer = express();

    expressServer.use(morgan('dev'));
    const hbs = exphbs.create({
      extname: '.hbs',
      defaultLayout: null,
      partialsDir: path.join(__dirname, 'views/'),
      layoutsDir: path.join(__dirname, 'views/'),
      helpers: {
        json: (_) => JSON.stringify(_),
      }
    });
    expressServer.engine('handlebars', hbs.engine);
    expressServer.set('view engine', 'handlebars');
    expressServer.set('views', path.join(__dirname, './views'));
    expressServer.use(express.static(Config.STATIC_FILES_PATH));

    expressServer.use(getSession());
    initPassport(expressServer);

    const httpServer = http.createServer(expressServer);
    const io = new Server(httpServer, {});

    // initSockets({
    //   io,
    // });

    expressServer.use(require('routes'));
  }

  return expressServer;
}
