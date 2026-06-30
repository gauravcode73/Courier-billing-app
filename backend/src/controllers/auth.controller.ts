import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'amodxpress_secret_jwt_key_12345';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

export const login = async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: 'Username and password are required' });
    return;
  }

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '24h' });
    res.json({
      token,
      user: { username },
      message: 'Login successful',
    });
  } else {
    res.status(401).json({ error: 'Invalid username or password' });
  }
};

export const verifyToken = async (req: Request, res: Response): Promise<void> => {
  // If the request passes the auth middleware, it is valid
  res.json({
    valid: true,
    user: (req as any).user,
  });
};
