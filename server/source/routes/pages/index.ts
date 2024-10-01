import * as express from 'express';

const HTML_REQ_HEADERS = [
  'text/html',
  'application/xhtml+xml',
  'application/xml',
];

const routes = express.Router();

const renderMain = (req, res) => {
  // @ts-ignore
  const user: User = req.user;

  res.render('main', {
    __STATE__: {
      self: user ? user.toPrivateJSON() : null,
    }
  });
};

routes.use((req, res, next) => {
  // @ts-ignore
  req.isRequestForHTML = HTML_REQ_HEADERS.some(str => req?.headers?.accept?.includes(str));
  next();
});

routes.get('/', (req, res) => {
  renderMain(req, res);
});

routes.get('*', (req, res, next) => {
  // @ts-ignore
  if (!req.isRequestForHTML) {
    next();
    return;
  }

  renderMain(req, res);
});

module.exports = routes;
export {}