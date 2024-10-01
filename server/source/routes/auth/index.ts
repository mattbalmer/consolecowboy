import * as express from 'express';
import passport from 'passport';
const routes = express.Router();

routes.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/');
  });
});

routes.get('/google',
  passport.authenticate('google', {
    scope: [
      'profile',
      'email',
    ],
    session: true
  })
);

routes.get('/google/callback',
  passport.authenticate('google', {
    successRedirect: '/',
    failureRedirect: '/' // maybe /login-failed in the future
  })
);

module.exports = routes;
export {}