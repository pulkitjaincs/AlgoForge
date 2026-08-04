import { prisma } from '../config/database.js';

export class TokenRepository {
  async createRefreshToken(userId: string, hashedToken: string, expiresInDays: number) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    return prisma.refreshToken.create({
      data: {
        userId,
        token: hashedToken,
        expiresAt,
      },
    });
  }

  async findByToken(hashedToken: string) {
    return prisma.refreshToken.findUnique({
      where: { token: hashedToken },
    });
  }

  async delete(hashedToken: string) {
    return prisma.refreshToken.delete({
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
