import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateTokens, refreshAccess } from '../../services/auth.service.js';
import { tokenRepository } from '../../repositories/token.repository.js';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';

vi.mock('../../repositories/token.repository.js', () => ({
  tokenRepository: {
    createRefreshToken: vi.fn(),
    findByToken: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('../../config/env.js', () => ({
  env: {
    JWT_SECRET: 'test-secret',
    JWT_REFRESH_SECRET: 'test-refresh-secret',
    JWT_EXPIRES_IN: '15m',
    JWT_REFRESH_EXPIRES_IN: '7d',
  },
}));

describe('Auth Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateTokens', () => {
    it('should generate access and refresh tokens', async () => {
      (tokenRepository.createRefreshToken as any).mockResolvedValue({ id: 'rt-1', token: 'mock-rt' });

      const result = await generateTokens('user-1');

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      
      const decodedAccess = jwt.verify(result.accessToken, 'test-secret') as any;
      expect(decodedAccess.userId).toBe('user-1');
      
      expect(tokenRepository.createRefreshToken).toHaveBeenCalledWith(
        'user-1',
        expect.any(String),
        7
      );
    });
  });

  describe('refreshAccess', () => {
    it('should throw error for invalid refresh token', async () => {
      (tokenRepository.findByToken as any).mockResolvedValue(null);
      await expect(refreshAccess('invalid-token')).rejects.toThrow('Invalid refresh token');
    });

    it('should rotate token successfully', async () => {
      
      (tokenRepository.findByToken as any).mockResolvedValue({
        id: 'rt-id',
        userId: 'user-1',
        token: 'hashed-valid-token',
        expiresAt: new Date(Date.now() + 100000)
      });

      (tokenRepository.createRefreshToken as any).mockResolvedValue({ id: 'new-rt', token: 'mock-new-rt' });

      const result = await refreshAccess('valid-token');

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(tokenRepository.delete).toHaveBeenCalledWith(expect.any(String));
      expect(tokenRepository.createRefreshToken).toHaveBeenCalledWith('user-1', expect.any(String), 7);
    });
  });
});
