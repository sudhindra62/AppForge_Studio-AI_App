import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json'],
      reportsDirectory: './reports/coverage'
    },
    include: ['tests/api/**/*.test.ts', 'tests/database/**/*.test.ts', 'tests/security/**/*.test.ts', 'tests/performance/**/*.test.ts'],
  },
});
