// @ts-check
const { test, expect } = require('../fixtures');

test.describe('TC-03 Protected pages cannot be opened without logging in', () => {
  const protectedPages = [
    { url: '/inventory.html', path: '/inventory.html' },
    { url: '/cart.html', path: '/cart.html' },
    { url: '/checkout-step-one.html', path: '/checkout-step-one.html' },
    { url: '/checkout-step-two.html', path: '/checkout-step-two.html' },
    { url: '/inventory-item.html?id=4', path: '/inventory-item.html' },
  ];

  for (const { url, path } of protectedPages) {
    test(`TC-03 ${path} shows the login form instead of the page`, async ({ page, loginPage }) => {
      await page.goto(url);

      await expect(loginPage.loginButton).toBeVisible();
      await expect(loginPage.error).toHaveText(`Epic sadface: You can only access '${path}' when you are logged in.`);
      await expect(page.getByTestId('title')).toHaveCount(0);
    });
  }
});

test('TC-04 browser Back after logout does not show the Products page', async ({ page, loggedIn: inventory, loginPage }) => {
  await inventory.header.logout();
  await expect(loginPage.loginButton).toBeVisible();

  await page.goBack();

  await expect(loginPage.error).toHaveText("Epic sadface: You can only access '/inventory.html' when you are logged in.");
  await expect(page.getByTestId('inventory-list')).toHaveCount(0);
});
