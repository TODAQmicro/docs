import { defineConfig } from 'vitest/config';

// Unit tests only. The page checks in tests/e2e run under Playwright.
export default defineConfig({
  test: {
    include: ['tests/unit/**/*.test.ts'],
  },
});
