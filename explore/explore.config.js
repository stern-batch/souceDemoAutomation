// @ts-check
const { defineConfig, devices } = require('@playwright/test');

// Throwaway probes used during exploratory testing (Task A). Not part of the regression suite.
module.exports = defineConfig({
  testDir: '.',
  testMatch: /.*\.probe\.js/,
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'https://www.saucedemo.com',
    ...devices['Desktop Chrome'],
    channel: 'chrome',
  },
});
