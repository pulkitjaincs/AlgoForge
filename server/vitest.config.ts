import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    env: {
      DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
      JWT_SECRET: 'super_secret_test_jwt_key_that_is_at_least_32_characters_long'
    },
    include: ['src/**/*.test.ts'],
    setupFiles: ['./src/tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json'],
      exclude: ['src/tests/**', 'dist/**'],
    },
  },
});
