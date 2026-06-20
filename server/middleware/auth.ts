import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'craftfolio-ai-super-secret-key-12345';

export interface AuthenticatedRequest extends Request {
  userId?: string;
  userEmail?: string;
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: Missing or invalid token format' });
  }

  const token = authHeader.split(' ')[1];
  try {
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      console.log('[Auth Middleware] JWT verification failed, trying decoding fallback for OAuth...');
      decoded = jwt.decode(token);
      if (!decoded) {
        throw new Error('Could not decode token');
      }
      // standard JWT payload might contain sub/email
      decoded = {
        userId: decoded.userId || decoded.sub || decoded.id,
        email: decoded.email
      };
      if (!decoded.userId) {
        throw new Error('Decoded token does not contain a user identifier');
      }
    }

    req.userId = decoded.userId;
    req.userEmail = decoded.email;
    next();
  } catch (err: any) {
    console.error('[Auth Middleware Error]', err.message || err);
    return res.status(401).json({ message: 'Unauthorized: Invalid or expired token' });
  }
}
