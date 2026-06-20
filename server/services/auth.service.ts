import bcrypt from 'bcrypt';
import { prisma } from '../config/db';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';

export class AuthService {
  static async register(email: string, passwordHashRaw: string, fullName?: string) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new Error('User already exists with this email');
    }

    const passwordHash = await bcrypt.hash(passwordHashRaw, 10);
    
    // Transact User + Profile creation
    const user = await prisma.$transaction(async (tx) => {
      const u = await tx.user.create({
        data: {
          email,
          passwordHash,
        },
      });

      await tx.profile.create({
        data: {
          id: u.id,
          fullName: fullName || '',
          theme: 'dark',
        },
      });

      return u;
    });

    const accessToken = generateAccessToken({ userId: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

    return {
      user: { id: user.id, email: user.email },
      accessToken,
      refreshToken,
    };
  }

  static async login(email: string, passwordRaw: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    const matches = await bcrypt.compare(passwordRaw, user.passwordHash);
    if (!matches) {
      throw new Error('Invalid email or password');
    }

    const accessToken = generateAccessToken({ userId: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

    return {
      user: { id: user.id, email: user.email, onboardingCompleted: user.profile?.onboardingCompleted },
      accessToken,
      refreshToken,
    };
  }

  static async refresh(token: string) {
    const decoded = verifyRefreshToken(token);
    if (!decoded) {
      throw new Error('Invalid refresh token');
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user) {
      throw new Error('User not found');
    }

    const accessToken = generateAccessToken({ userId: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email },
    };
  }

  static async getUser(userId: string, email?: string) {
    let user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user && email) {
      console.log(`[AuthService] Provisioning new user for OAuth: id=${userId}, email=${email}`);
      user = await prisma.$transaction(async (tx) => {
        const u = await tx.user.create({
          data: {
            id: userId,
            email,
            passwordHash: '', // Empty password hash for OAuth
          },
        });
        const p = await tx.profile.create({
          data: {
            id: u.id,
            fullName: email.split('@')[0],
            theme: 'dark',
          },
        });
        return { ...u, profile: p };
      });
    } else if (!user) {
      throw new Error('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      onboardingCompleted: user.profile?.onboardingCompleted,
      fullName: user.profile?.fullName,
      avatarUrl: user.profile?.avatarUrl,
      headline: user.profile?.headline,
      careerPath: user.profile?.careerPath,
    };
  }

  static async resetPassword(userId: string, passwordRaw: string) {
    const passwordHash = await bcrypt.hash(passwordRaw, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
  }
}
