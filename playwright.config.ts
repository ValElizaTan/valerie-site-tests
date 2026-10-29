import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.BASE_URL;
if (!baseURL) {
  throw new Error('Set BASE_URL to the live site URL, e.g. BASE_URL=https://valelizatan.github.io/valerie-site/');
}

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    // Trailing slash so page.goto('./') stays inside a sub-path deployment such as GitHub Pages.
    baseURL: baseURL.endsWith('/') ? baseURL : `${baseURL}/`,
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
