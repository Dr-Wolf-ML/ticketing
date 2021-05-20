import { Request, Response, NextFunction } from 'express';

import { NotAuthorisedError } from '../errors/not-authorised-error';

// assumes that currentUser Middleware is run prior to this
export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.currentUser) {
    throw new NotAuthorisedError();
  }

  next();
};
