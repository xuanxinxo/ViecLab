import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'your-refresh-secret-key';
const TOKEN_EXPIRES_IN = '15m';
const REFRESH_TOKEN_EXPIRES_IN = '7d';

export const generateAccessToken = (userId: string, email: string, role: string) => {
  return jwt.sign(
    { userId, email, role },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRES_IN }
  );
};

export const generateRefreshToken = (userId: string) => {
  return jwt.sign(
    { userId },
    REFRESH_TOKEN_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
  );
};

export const generateRandomToken = (bytes = 32): string => {
  return crypto.randomBytes(bytes).toString('hex');
};

export const verifyToken = (token: string, isRefreshToken = false) => {
  try {
    const secret = isRefreshToken ? REFRESH_TOKEN_SECRET : JWT_SECRET;
    return jwt.verify(token, secret);
  } catch (error) {
    return null;
  }
};

export const getTokenExpiration = (minutes = 60): Date => {
  const now = new Date();
  now.setMinutes(now.getMinutes() + minutes);
  return now;
};
