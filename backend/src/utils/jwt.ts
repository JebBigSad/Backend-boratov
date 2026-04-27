import jwt from 'jsonwebtoken';

const JWT_FALLBACK_SECRET = 'development_only_change_me';
const JWT_EXPIRES_IN = '12h';

export function getJwtSecret(): string {
  return process.env.JWT_SECRET || JWT_FALLBACK_SECRET;
}

export function signJwt(payload: Record<string, unknown>): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: JWT_EXPIRES_IN });
}
