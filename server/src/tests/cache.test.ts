import { describe, it, expect, vi } from 'vitest';

vi.unmock('../utils/cache.js');
vi.mock('../config/redis.js', () => ({
  redis: null,
}));

import { cache } from '../utils/cache.js';

describe('Cache Utility - Graceful Degradation', () => {
  it('get returns null if redis is down', async () => {
    const result = await cache.get('some-key');
    expect(result).toBeNull();
  });

  it('set does not throw if redis is down', async () => {
    await expect(cache.set('key', { data: 1 })).resolves.toBeUndefined();
  });

  it('invalidate does not throw if redis is down', async () => {
    await expect(cache.invalidate('key')).resolves.toBeUndefined();
  });

  it('setWithTag does not throw if redis is down', async () => {
    await expect(cache.setWithTag('key', 'tag', { data: 1 })).resolves.toBeUndefined();
  });

  it('invalidateTag does not throw if redis is down', async () => {
    await expect(cache.invalidateTag('tag')).resolves.toBeUndefined();
  });
});
