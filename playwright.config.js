import { defineConfig, devices } from '@playwright/test';

// These tests cover the features that are supposed to work. The planted bugs are
// verified separately, in a private answer-key repo, so this file spoils nothing.
export default defineConfig({
  testDir: 'tests',
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['junit', { outputFile: 'test-results/junit.xml' }], ['html', { open: 'never' }]],
  use: { baseURL: process.env.BASE_URL ?? 'http://localhost:4173', trace: 'retain-on-failure' },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: process.env.BASE_URL ? undefined : { command: 'npm run serve', url: 'http://localhost:4173', reuseExistingServer: !process.env.CI },
});
