import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 120_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  retries: 0,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: 'http://localhost:3001',
    trace: 'on-first-retry',
  },
  outputDir: './screenshots',
  webServer: {
    command: 'node .output/server/index.mjs',
    port: 3001,
    reuseExistingServer: true,
    env: { PORT: '3001', DATABASE_URL: process.env.DATABASE_URL || 'postgres://symbolrush:symbolrush@localhost:5434/symbol_rush' },
  },
})
