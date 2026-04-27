import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { getJwtSecret } from "../utils/jwt";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        username?: string;
        role?: string;
      };
    }
  }
}

interface JwtPayload {
  id: number;
  email: string;
  username?: string;
  role?: string;
}

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Токен не предоставлен" });
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret()) as JwtPayload;
    req.user = {
      id: decoded.id,
      email: decoded.email,
      username: decoded.username,
      role: decoded.role,
    };
    next();
  } catch (error: any) {
    return res.status(403).json({ error: "Недействительный токен" });
  }
};
