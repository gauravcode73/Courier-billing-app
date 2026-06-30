import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'amodxpress_secret_jwt_key_12345';

export interface AuthenticatedRequest extends Request {
  user?: {
    username: string;
  };
}

export const authenticateJWT = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1]; // Bearer <token>

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        res.status(403).json({ error: 'Forbidden: Invalid or expired token' });
        return;
      }

      (req as AuthenticatedRequest).user = decoded as { username: string };
      next();
    });
  } else {
    res.status(401).json({ error: 'Unauthorized: Access token missing' });
  }
};
