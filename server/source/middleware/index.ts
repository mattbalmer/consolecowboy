export function requireAuthentication(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.status(403).json({
      message: 'Must be signed in to continue',
    });
  }
}

export function requireSelf(getId: (req: any) => string) {
  return (req, res, next) => {
    const id = getId(req);
    if(req.user._id.toString() === id.toString()) {
      next();
    } else {
      res.status(403).json({
        message: 'May not perform this action on a user other than yourself without admin privileges',
      });
    }
  }
}

export function setReqDate(date) {
  return function(req, res, next) {
    req.body[`dates.${date}`] = new Date().getTime();
    next();
  }
}
