import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockStorage = new Map<string, Buffer>();
const mockSets = new Map<string, Set<string>>();

vi.unmock('../utils/cache.js');
vi.mock('../config/redis.js', () => ({
  redis: {
    getBuffer: vi.fn(async (key: string) => mockStorage.get(key) || null),
    set: vi.fn(async (key: string, val: Buffer) => {
      mockStorage.set(key, val);
    }),
    del: vi.fn(async (...keys: string[]) => {
      for (const k of keys) {
        mockStorage.delete(k);
        mockSets.delete(k);
      }
    }),
    sadd: vi.fn(async (tagKey: string, key: string) => {
      if (!mockSets.has(tagKey)) mockSets.set(tagKey, new Set());
      mockSets.get(tagKey)!.add(key);
    }),
    expire: vi.fn(async () => 1),
    smembers: vi.fn(async (tagKey: string) => {
      return Array.from(mockSets.get(tagKey) || []);
    }),
    scan: vi.fn(async (_cursor: string) => ['0', []]),
  },
}));

import { cache } from '../utils/cache.js';

describe('Cache Utility - Brotli Compression & Tag Invalidation', () => {
  beforeEach(() => {
    mockStorage.clear();
    mockSets.clear();
  });

  it('compresses with Brotli and decompresses complex data structures accurately', async () => {
    const complexData = {
      user: { id: 'usr-1', username: 'coder42' },
      topics: [
        { id: 't1', title: 'Dynamic Programming', questions: [{ id: 'q1', title: 'Coin Change' }] }
      ],
      metrics: { score: 98.6, solved: 154 }
    };

    await cache.set('complex:key', complexData, 300);

    // Verify stored data is a compressed buffer, not raw JSON string
    const rawBuffer = mockStorage.get('complex:key');
    expect(rawBuffer).toBeDefined();
    expect(Buffer.isBuffer(rawBuffer)).toBe(true);
    expect(rawBuffer!.toString('utf-8')).not.toBe(JSON.stringify(complexData));

    // Verify get decompresses correctly back to original data
    const retrieved = await cache.get<typeof complexData>('complex:key');
    expect(retrieved).toEqual(complexData);
  });

  it('correctly associates tag and invalidates all keys under tag', async () => {
    const stats1 = { dueToday: 3, overdue: 1 };
    const queue1 = [{ id: 'q1' }, { id: 'q2' }];

    await cache.setWithTag('review_stats:u1', 'user:u1:review', stats1, 300);
    await cache.setWithTag('review_queue:u1', 'user:u1:review', queue1, 300);

    expect(await cache.get('review_stats:u1')).toEqual(stats1);
    expect(await cache.get('review_queue:u1')).toEqual(queue1);

    // Invalidate tag
    await cache.invalidateTag('user:u1:review');

    expect(await cache.get('review_stats:u1')).toBeNull();
    expect(await cache.get('review_queue:u1')).toBeNull();
  });

  it('handles corrupted cache buffer gracefully by returning null without throwing', async () => {
    mockStorage.set('corrupt:key', Buffer.from('this is definitely not a valid brotli compressed stream'));

    const result = await cache.get('corrupt:key');
    expect(result).toBeNull();
  });
});
