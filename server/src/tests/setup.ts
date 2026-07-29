import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset, DeepMockProxy } from 'vitest-mock-extended';
import { prisma } from '../config/database.js';
import { vi } from 'vitest';

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
