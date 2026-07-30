import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset, DeepMockProxy } from 'vitest-mock-extended';
import { prisma } from '../config/database.js';
import { vi } from 'vitest';

process.env.JWT_SECRET = 'super_secret_test_jwt_key_that_is_at_least_32_characters_long';

// Mock the cache utility
vi.mock('../utils/cache.js', () => ({
  cache: {
    get: vi.fn(),
    set: vi.fn(),
    invalidate: vi.fn(),
    setWithTag: vi.fn(),
    invalidateTag: vi.fn(),
  },
}));

// Deep mock the PrismaClient
vi.mock('../config/database.js', () => ({
  prisma: mockDeep<PrismaClient>(),
}));

beforeEach(() => {
  mockReset(prisma as unknown as DeepMockProxy<PrismaClient>);
});
