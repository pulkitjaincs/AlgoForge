import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as authService from '../../services/auth.service.js';
import { tokenRepository } from '../../repositories/token.repository.js';
import { AppError } from '../../utils/AppError.js';

vi.mock('../../repositories/token.repository.js', () => ({
  tokenRepository: {
    createRefreshToken: vi.fn(),
    findByToken: vi.fn(),
    markTokenRevoked: vi.fn(),
    revokeFamily: vi.fn(),
    revokeAllUserTokens: vi.fn(),
    enforceMaxActiveSessions: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn(),
  },
}));

vi.mock('../../repositories/user.repository.js', () => ({
  userRepository: {
    findByEmail: vi.fn(),
    create: vi.fn(),
  },
}));

describe('Refresh Token Family & Replay Attack Security', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('generates tokens with a newly created family lineage', async () => {
    const tokens = await authService.generateTokens('user-123');

    expect(tokens.accessToken).toBeDefined();
    expect(tokens.refreshToken).toBeDefined();
    expect(tokenRepository.createRefreshToken).toHaveBeenCalledWith(
      'user-123',
      expect.any(String),
      7,
      expect.any(String), // family UUID
      undefined,
      undefined
    );
    expect(tokenRepository.enforceMaxActiveSessions).toHaveBeenCalledWith('user-123', 5);
  });

  it('rotates refresh token preserving the existing family lineage', async () => {
    const fakeToken = 'a'.repeat(80);
    const mockRecord = {
      id: 'tok-1',
      token: 'somehash',
      userId: 'user-123',
      family: 'family-abc',
      isRevoked: false,
      expiresAt: new Date(Date.now() + 100000),
    };

    vi.mocked(tokenRepository.findByToken).mockResolvedValue(mockRecord as any);

    const rotated = await authService.refreshAccess(fakeToken);

    // Old token should be marked revoked
    expect(tokenRepository.markTokenRevoked).toHaveBeenCalled();
    // New token created with same family lineage
    expect(tokenRepository.createRefreshToken).toHaveBeenCalledWith(
      'user-123',
      expect.any(String),
      7,
      'family-abc',
      undefined,
      undefined
    );
    expect(rotated.accessToken).toBeDefined();
    expect(rotated.refreshToken).toBeDefined();
  });

  it('detects replay attack and revokes entire family when revoked token is reused', async () => {
    const fakeToken = 'b'.repeat(80);
    const revokedRecord = {
      id: 'tok-old',
      token: 'somehash',
      userId: 'user-123',
      family: 'family-compromised',
      isRevoked: true, // Already rotated/revoked!
      expiresAt: new Date(Date.now() + 100000),
    };

    vi.mocked(tokenRepository.findByToken).mockResolvedValue(revokedRecord as any);

    await expect(authService.refreshAccess(fakeToken)).rejects.toThrow(AppError);
    // Entire family must be revoked immediately
    expect(tokenRepository.revokeFamily).toHaveBeenCalledWith('family-compromised');
  });
});
