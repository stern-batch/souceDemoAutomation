// @ts-check
const { defineConfig, devices } = require('@playwright/test');

const isCI = !!process.env.CI;

// SUITE selects what runs. Default is the original 5 core tests, so known-defect tests can never turn `npm test` red.
const suites = {
  core: /tests\/[^/]+\.spec\.js$/,
  regression: /tests\/regression\/.+\.spec\.js$/,
  defects: /tests\/defects\/.+\.spec\.js$/,
};
const suite = process.env.SUITE ?? 'core';
const testMatch = suite === 'all' ? Object.values(suites) : suites[/** @type {keyof suites} */ (suite)];
if (!testMatch) throw new Error(`Unknown SUITE "${suite}". Use one of: ${Object.keys(suites).join(', ')}, all`);

const chrome = { name: 'chrome', use: { ...devices['Desktop Chrome'], channel: 'chrome' } };
const firefox = { name: 'firefox', use: { ...devices['Desktop Firefox'] } };

module.exports = defineConfig({
  testDir: './tests',
  testMatch,
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI && suite !== 'defects' ? 1 : 0,
  workers: isCI ? 2 : undefined,
  timeout: 30_000,
  expect: { timeout: 5_000 },
  reporter: [['list'], ['html', { open: 'never', outputFolder: suite === 'core' ? 'playwright-report' : `playwright-report-${suite}` }]],
  outputDir: suite === 'core' ? 'test-results' : `test-results-${suite}`,
  use: {
    baseURL: process.env.BASE_URL ?? 'https://www.saucedemo.com',
    testIdAttribute: 'data-test',
    headless: true,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  // Google Chrome is the primary target; Firefox is opt-in with ALL_BROWSERS=1.
  projects: process.env.ALL_BROWSERS ? [chrome, firefox] : [chrome],
});
