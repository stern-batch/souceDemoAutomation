const { test, expect } = require('@playwright/test');

const EV = 'evidence';
const text = async (l) => ((await l.count()) ? l.first().textContent() : null);
const note = (id, d) => console.log(`\n### ${id}\n${JSON.stringify(d, null, 2)}`);

async function login(page, user = 'standard_user') {
  await page.goto('/');
  await page.locator('[data-test="username"]').fill(user);
  await page.locator('[data-test="password"]').fill('secret_sauce');
  await page.locator('[data-test="login-button"]').click();
  await page.locator('[data-test="inventory-list"]').waitFor();
}

test('H06 retake evidence with menu closed', async ({ page }) => {
  await login(page);
  await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
  await page.locator('[data-test="add-to-cart-sauce-labs-bike-light"]').click();
  await page.getByRole('button', { name: 'Open Menu' }).click();
  await page.locator('[data-test="reset-sidebar-link"]').click();
  await page.getByRole('button', { name: 'Close Menu' }).click();
  await expect(page.locator('[data-test="reset-sidebar-link"]')).toBeHidden();
  await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveCount(0);
  await page.screenshot({ path: `${EV}/D4-reset-state-stale-remove-buttons.png` });
});

test('H14b phantom item through checkout', async ({ page }) => {
  await login(page);
  await page.goto('/inventory-item.html?id=999');
  await page.locator('button[data-test^="add-to-cart"]').click();
  await page.goto('/checkout-step-one.html');
  await page.locator('[data-test="firstName"]').fill('A');
  await page.locator('[data-test="lastName"]').fill('B');
  await page.locator('[data-test="postalCode"]').fill('1');
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.locator('[data-test="continue"]').click();
  await page.waitForLoadState('networkidle');
  const body = (await page.locator('body').innerText()).slice(0, 300);
  await page.screenshot({ path: `${EV}/D5c-checkout-overview-crash.png`, fullPage: true });
  note('H14b', { path: new URL(page.url()).pathname, pageErrors: errors, bodyText: body });
});

test('H17 Dynamic Catalog menu', async ({ page }) => {
  await login(page);
  await page.getByRole('button', { name: 'Open Menu' }).click();
  await page.getByText('Dynamic Catalog').click();
  const links = await page.locator('.bm-item-list a, .bm-item-list button').allTextContents();
  await page.screenshot({ path: 'explore/dynamic-catalog-menu.png' });
  note('H17', { menuEntries: links });
});
