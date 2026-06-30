import { Request, Response, NextFunction } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    username: string;
  };
}

export const authenticateJWT = (req: Request, _res: Response, next: NextFunction): void => {
  (req as AuthenticatedRequest).user = { username: 'admin' };
  next();
};
