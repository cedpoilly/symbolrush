import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 120_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  retries: 0,
  preserveOutput: 'always',
  reporter: [['html', { open: 'never', outputFolder: './playwright-report' }], ['list']],
  use: {
    baseURL: 'http://localhost:3001',
    trace: 'on-first-retry',
    video: { mode: 'on', size: { width: 1280, height: 720 } },
  },
  outputDir: './test-results',
  webServer: {
    command: 'node .output/server/index.mjs',
    port: 3001,
    reuseExistingServer: true,
    env: { PORT: '3001', DATABASE_URL: process.env.DATABASE_URL || 'postgres://symbolrush:symbolrush@localhost:5434/symbol_rush' },
  },
})
