import { prisma } from '../config/database.js';

export class TokenRepository {
  async createRefreshToken(
    userId: string,
    hashedToken: string,
    expiresInDays: number,
    family?: string,
    deviceInfo?: string,
    ipAddress?: string
  ) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    return prisma.refreshToken.create({
      data: {
        userId,
        token: hashedToken,
        expiresAt,
        family,
        deviceInfo,
        ipAddress,
        isRevoked: false,
      },
    });
  }

  async findByToken(hashedToken: string) {
    return prisma.refreshToken.findUnique({
      where: { token: hashedToken },
    });
  }

  async markTokenRevoked(hashedToken: string) {
    return prisma.refreshToken.updateMany({
      where: { token: hashedToken },
      data: { isRevoked: true },
    });
  }

  async revokeFamily(family: string) {
    return prisma.refreshToken.deleteMany({
      where: { family },
    });
  }

  async revokeAllUserTokens(userId: string) {
    return prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }

  async enforceMaxActiveSessions(userId: string, maxSessions: number = 5) {
    const tokens = await prisma.refreshToken.findMany({
      where: { userId, isRevoked: false },
      orderBy: { createdAt: 'desc' },
      select: { family: true, createdAt: true },
    });

    const uniqueFamilies: string[] = [];
    for (const t of tokens) {
      if (t.family && !uniqueFamilies.includes(t.family)) {
        uniqueFamilies.push(t.family);
      }
    }

    if (uniqueFamilies.length > maxSessions) {
      const familiesToEvict = uniqueFamilies.slice(maxSessions);
      await prisma.refreshToken.deleteMany({
        where: {
          userId,
          family: { in: familiesToEvict },
        },
      });
    }
  }

  async delete(hashedToken: string) {
    return prisma.refreshToken.deleteMany({
      where: { token: hashedToken },
    });
  }

  async deleteExpiredTokens() {
    return prisma.refreshToken.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
  }
}

export const tokenRepository = new TokenRepository();
