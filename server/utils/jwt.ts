import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'craftfolio-ai-super-secret-key-12345';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'craftfolio-ai-super-refresh-key-67890';

export function generateAccessToken(payload: { userId: string; email: string }) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
}

export function generateRefreshToken(payload: { userId: string; email: string }) {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' });
}

export function verifyRefreshToken(token: string) {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as { userId: string; email: string };
  } catch (err) {
    return null;
  }
}
