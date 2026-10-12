import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  use: {
    baseURL: 'http://127.0.0.1:5191',
    channel: process.platform === 'win32' ? 'msedge' : 'chromium',
  },
  webServer: {
    command: 'pnpm exec vite preview --host 127.0.0.1 --port 5191 --strictPort',
    url: 'http://127.0.0.1:5191',
    reuseExistingServer: false,
  },
});
