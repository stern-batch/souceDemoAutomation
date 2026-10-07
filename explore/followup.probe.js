const { test } = require('@playwright/test');

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

test('H06 Reset App State leaves stale Remove buttons', async ({ page }) => {
  await login(page);
  await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
  await page.locator('[data-test="add-to-cart-sauce-labs-onesie"]').click();
  await page.getByRole('button', { name: 'Open Menu' }).click();
  await page.locator('[data-test="reset-sidebar-link"]').click();
  await page.getByRole('button', { name: 'Close Menu' }).click();
  await page.locator('.bm-menu-wrap[aria-hidden="true"]').waitFor({ state: 'attached' });
  const badge = await page.locator('[data-test="shopping-cart-badge"]').count();
  const removeButtons = await page.locator('button[data-test^="remove-"]').count();
  await page.screenshot({ path: `explore/reset-state-first-attempt.png` });
  await page.locator('[data-test="remove-sauce-labs-backpack"]').click();
  const afterStaleClick = {
    badge: await text(page.locator('[data-test="shopping-cart-badge"]')),
    backpackButton: await page.locator('[data-test$="sauce-labs-backpack"]').getAttribute('data-test'),
    onesieButton: await page.locator('[data-test$="sauce-labs-onesie"]').getAttribute('data-test'),
  };
  await page.reload();
  const removeAfterReload = await page.locator('button[data-test^="remove-"]').count();
  note('H06', { badgeCountAfterReset: badge, removeButtonsAfterReset: removeButtons, afterStaleClick, removeAfterReload });
});

test('H07 checkout field validation', async ({ page }) => {
  await login(page);
  await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
  const cases= {
    allEmpty: ['', '', ''],
    whitespaceOnly: ['   ', '   ', '   '],
    nonsensePostal: ['John', 'Doe', '!!@@##'],
    scriptInName: ['<img src=x onerror=alert(1)>', 'Doe', '12345'],
    veryLong: ['A'.repeat(500), 'B'.repeat(500), '9'.repeat(200)],
  };
  let dialog = false;
  page.on('dialog', d => { dialog = true; d.dismiss(); });
  const out= {};
  for (const [k, [f, l, z]] of Object.entries(cases)) {
    await page.goto('/checkout-step-one.html');
    await page.locator('[data-test="firstName"]').fill(f);
    await page.locator('[data-test="lastName"]').fill(l);
    await page.locator('[data-test="postalCode"]').fill(z);
    if (k === 'whitespaceOnly') await page.screenshot({ path: `${EV}/D2b-whitespace-only-info.png` });
    await page.locator('[data-test="continue"]').click();
    await page.waitForLoadState();
    out[k] = { path: new URL(page.url()).pathname, error: await text(page.locator('[data-test="error"]')) };
    if (k === 'whitespaceOnly') await page.screenshot({ path: `${EV}/D2c-whitespace-accepted-overview.png`, fullPage: true });
  }
  out.scriptDialogFired = dialog;
  note('H07', out);
});

test('H14 invalid product id page allows add-to-cart', async ({ page }) => {
  await login(page);
  await page.goto('/inventory-item.html?id=999');
  const name = await text(page.locator('[data-test="inventory-item-name"]'));
  const price = await text(page.locator('[data-test="inventory-item-price"]'));
  await page.locator('button[data-test^="add-to-cart"]').click();
  const badge = await text(page.locator('[data-test="shopping-cart-badge"]'));
  await page.screenshot({ path: `${EV}/D5a-item-not-found-add-to-cart.png` });
  await page.goto('/cart.html');
  const cartItems = await page.locator('[data-test="inventory-item"]').count();
  const ls = await page.evaluate(() => localStorage.getItem('cart-contents'));
  await page.screenshot({ path: `${EV}/D5b-cart-after-invalid-item.png`, fullPage: true });
  let checkoutPath = null;
  if (cartItems >= 0) {
    await page.locator('[data-test="checkout"]').click();
    await page.locator('[data-test="firstName"]').fill('A');
    await page.locator('[data-test="lastName"]').fill('B');
    await page.locator('[data-test="postalCode"]').fill('1');
    await page.locator('[data-test="continue"]').click();
    checkoutPath = new URL(page.url()).pathname;
  }
  const overview = { items: await page.locator('[data-test="inventory-item"]').count(), total: await text(page.locator('[data-test="total-label"]')) };
  note('H14', { name, price, badgeAfterAdd: badge, cartItemsRendered: cartItems, localStorageCart: ls, checkoutPath, overview });
});

test('H15 cart leak across users - evidence', async ({ page }) => {
  await login(page, 'standard_user');
  await page.locator('[data-test="add-to-cart-sauce-labs-fleece-jacket"]').click();
  await page.getByRole('button', { name: 'Open Menu' }).click();
  await page.locator('[data-test="logout-sidebar-link"]').click();
  await page.locator('[data-test="login-button"]').waitFor();
  const lsAfterLogout = await page.evaluate(() => localStorage.getItem('cart-contents'));
  await login(page, 'visual_user');
  await page.locator('[data-test="shopping-cart-link"]').click();
  const items = await page.locator('[data-test="inventory-item-name"]').allTextContents();
  await page.screenshot({ path: `${EV}/D3-cart-carried-to-different-user.png`, fullPage: true });
  note('H15', { lsAfterLogout, visualUserCart: items });
});

test('H16 back button after order completion', async ({ page }) => {
  await login(page);
  await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
  await page.locator('[data-test="shopping-cart-link"]').click();
  await page.locator('[data-test="checkout"]').click();
  await page.locator('[data-test="firstName"]').fill('A');
  await page.locator('[data-test="lastName"]').fill('B');
  await page.locator('[data-test="postalCode"]').fill('1');
  await page.locator('[data-test="continue"]').click();
  await page.locator('[data-test="finish"]').click();
  await page.locator('[data-test="complete-header"]').waitFor();
  await page.goBack();
  const back = { path: new URL(page.url()).pathname, items: await page.locator('[data-test="inventory-item"]').count(), total: await text(page.locator('[data-test="total-label"]')) };
  note('H16', back);
});
