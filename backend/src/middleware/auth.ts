import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

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

  console.log('🔐 Проверка токена для:', req.method, req.path);
  console.log('📨 authHeader:', authHeader);
  
  if (!token) {
    console.log('❌ Токен не предоставлен');
    return res.status(401).json({ error: 'Токен не предоставлен' });
  }

  try {
    // Используем секрет из .env
    const secret = process.env.JWT_SECRET || 'my_secret_key_123';
    console.log('🔑 Используемый секрет:', secret);
    
    const decoded = jwt.verify(token, secret) as JwtPayload;
    req.user = { id: decoded.id, email: decoded.email, username: decoded.username };
    console.log('✅ Токен валиден для пользователя:', decoded.username || decoded.email);
    next();
  } catch (error: any) {
    console.log('❌ Недействительный токен:', error.message);
    return res.status(403).json({ error: 'Недействительный токен' });
  }
};