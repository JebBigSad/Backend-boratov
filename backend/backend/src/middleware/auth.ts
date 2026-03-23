import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Расширяем интерфейс Request, чтобы добавить user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        username?: string;
      };
    }
  }
}

interface JwtPayload {
  id: number;
  email: string;
  username?: string;
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; 

  if (!token) {
    return res.status(401).json({ error: 'Токен не предоставлен' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as JwtPayload;
    req.user = { id: decoded.id, email: decoded.email, username: decoded.username };
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Недействительный токен' });
  }
};