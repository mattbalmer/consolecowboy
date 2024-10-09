import * as express from 'express';
import * as parser from 'body-parser';
const routes = express.Router();

routes.use(parser.json());

routes.use('/levels', require('./levels'));

module.exports = routes;
export {}