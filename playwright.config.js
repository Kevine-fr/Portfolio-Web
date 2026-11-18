import { defineConfig, devices } from '@playwright/test';

// Tests d'affichage dans un vrai navigateur (le rendu responsive ne se
// vérifie pas dans jsdom). Le site est servi par `vite preview` après build.
export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  fullyParallel: true,
  reporter: process.env.CI ? [['github'], ['list']] : 'list',
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'off',
    ...devices['Desktop Chrome'],
    // Chromium préinstallé (environnements distants) ; sinon celui de Playwright
    launchOptions: process.env.PW_CHROMIUM_PATH ? { executablePath: process.env.PW_CHROMIUM_PATH } : {},
  },
  webServer: {
    command: 'npx vite preview --port 4173 --strictPort',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
