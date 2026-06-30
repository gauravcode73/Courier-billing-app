import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'amodxpress_secret_jwt_key_12345';

export interface AuthenticatedRequest extends Request {
  user?: {
    username: string;
  };
}

export const authenticateJWT = (req: Request, res: Response, next: NextFunction): void => {
  (req as AuthenticatedRequest).user = { username: 'admin' };
  next();
};
