import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { AuthenticatedRequest } from '../middleware/auth';

export class AuthController {
  static async register(req: Request, res: Response) {
    const { email, password, fullName } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
      const result = await AuthService.register(email, password, fullName);
      return res.status(201).json(result);
    } catch (err: any) {
      return res.status(400).json({ message: err.message });
    }
  }

  static async login(req: Request, res: Response) {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
      const result = await AuthService.login(email, password);
      return res.status(200).json(result);
    } catch (err: any) {
      return res.status(400).json({ message: err.message });
    }
  }

  static async logout(req: Request, res: Response) {
    // For JWT logout, the client discards tokens.
    // In a production app, we can blacklist the refresh token in Redis/DB.
    return res.status(200).json({ message: 'Logged out successfully' });
  }

  static async refresh(req: Request, res: Response) {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token is required' });
    }

    try {
      const result = await AuthService.refresh(refreshToken);
      return res.status(200).json(result);
    } catch (err: any) {
      return res.status(401).json({ message: err.message });
    }
  }

  static async getUser(req: AuthenticatedRequest, res: Response) {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
      const user = await AuthService.getUser(userId);
      return res.status(200).json({ user });
    } catch (err: any) {
      return res.status(404).json({ message: err.message });
    }
  }

  static async forgotPassword(req: Request, res: Response) {
    const { email, redirectTo } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Simulate link generation
    console.log(`[Auth] Forgot password link requested for ${email}. Redirecting to ${redirectTo || '/auth/reset-password'}`);
    return res.status(200).json({ message: 'Password reset link sent to your email.' });
  }

  static async resetPassword(req: AuthenticatedRequest, res: Response) {
    const userId = req.userId;
    const { password } = req.body;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    if (!password) {
      return res.status(400).json({ message: 'New password is required' });
    }

    try {
      await AuthService.resetPassword(userId, password);
      return res.status(200).json({ message: 'Password reset successful.' });
    } catch (err: any) {
      return res.status(400).json({ message: err.message });
    }
  }
}
