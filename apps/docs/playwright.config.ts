import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  use: {
    baseURL: 'http://127.0.0.1:5193',
    channel: process.platform === 'win32' ? 'msedge' : 'chromium',
  },
  webServer: {
    command: 'pnpm preview',
    url: 'http://127.0.0.1:5193',
    reuseExistingServer: false,
  },
});
