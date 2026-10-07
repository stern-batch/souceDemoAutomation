const { test } = require('@playwright/test');
const fs = require('fs');

const EV = 'evidence';
const results= {};
const note = (id, data) => {
  results[id] = data;
  console.log(`\n### ${id}\n${JSON.stringify(data, null, 2)}`);
};

async function login(page, user = 'standard_user') {
  await page.goto('/');
  await page.locator('[data-test="username"]').fill(user);
  await page.locator('[data-test="password"]').fill('secret_sauce');
  await page.locator('[data-test="login-button"]').click();
}

test.afterAll(() => {
  fs.writeFileSync('explore/results.json', JSON.stringify(results, null, 2));
});

test('H01 empty-cart checkout completes an order', async ({ page }) => {
  await login(page);
  await page.locator('[data-test="shopping-cart-link"]').click();
  const items = await page.locator('[data-test="inventory-item"]').count();
  await page.locator('[data-test="checkout"]').click();
  await page.locator('[data-test="firstName"]').fill('A');
  await page.locator('[data-test="lastName"]').fill('B');
  await page.locator('[data-test="postalCode"]').fill('1');
  await page.locator('[data-test="continue"]').click();
  const overviewTotal = await page.locator('[data-test="total-label"]').textContent();
  await page.screenshot({ path: `${EV}/D1a-empty-cart-overview.png`, fullPage: true });
  await page.locator('[data-test="finish"]').click();
  const header = await page.locator('[data-test="complete-header"]').textContent();
  await page.screenshot({ path: `${EV}/D1b-empty-cart-order-complete.png`, fullPage: true });
  note('H01', { cartItems: items, overviewTotal, url: page.url(), header });
});

test('H02 deep-link to checkout overview skips info step', async ({ page }) => {
  await login(page);
  await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
  await page.goto('/checkout-step-two.html');
  const url = page.url();
  const hasFinish = await page.locator('[data-test="finish"]').isVisible();
  await page.screenshot({ path: `${EV}/D2a-deeplink-overview-no-info.png`, fullPage: true });
  await page.locator('[data-test="finish"]').click();
  const header = await page.locator('[data-test="complete-header"]').textContent().catch(() => null);
  await page.goto('/checkout-complete.html');
  const directComplete = await page.locator('[data-test="complete-header"]').textContent().catch(() => null);
  note('H02', { url, hasFinish, headerAfterFinish: header, directCompleteHeader: directComplete });
});

test('H03 protected pages without login', async ({ page }) => {
  const out= {};
  for (const p of ['/inventory.html', '/cart.html', '/checkout-step-one.html', '/checkout-step-two.html', '/inventory-item.html?id=4']) {
    await page.goto(p);
    out[p] = `${new URL(page.url()).pathname} | ${await page.locator('[data-test="error"]').textContent().catch(() => null)}`;
  }
  note('H03', out);
});

test('H04 back button after logout + cookie inspection', async ({ page, context }) => {
  await login(page);
  const cookies = await context.cookies();
  const session = cookies.find(c => c.name === 'session-username');
  await page.getByRole('button', { name: 'Open Menu' }).click();
  await page.locator('[data-test="logout-sidebar-link"]').click();
  await page.goBack();
  const afterBack = { url: page.url(), error: await page.locator('[data-test="error"]').textContent().catch(() => null) };
  // forge the cookie without logging in
  await context.clearCookies();
  await context.addCookies([{ name: 'session-username', value: 'standard_user', domain: 'www.saucedemo.com', path: '/' }]);
  await page.goto('/inventory.html');
  const forged = { url: page.url(), inventoryVisible: await page.locator('[data-test="inventory-list"]').isVisible() };
  note('H04', {
    sessionCookie: session && { value: session.value, httpOnly: session.httpOnly, secure: session.secure,
      expiresInMin: Math.round((session.expires * 1000 - Date.now()) / 60000) },
    afterBack, forged,
  });
});

test('H05 cart persists across logout/login and across users', async ({ page }) => {
  await login(page);
  await page.locator('[data-test="add-to-cart-sauce-labs-bike-light"]').click();
  await page.getByRole('button', { name: 'Open Menu' }).click();
  await page.locator('[data-test="logout-sidebar-link"]').click();
  await login(page);
  const sameUserBadge = await page.locator('[data-test="shopping-cart-badge"]').textContent().catch(() => null);
  await page.getByRole('button', { name: 'Open Menu' }).click();
  await page.locator('[data-test="logout-sidebar-link"]').click();
  await login(page, 'visual_user');
  const otherUserBadge = await page.locator('[data-test="shopping-cart-badge"]').textContent().catch(() => null);
  const ls = await page.evaluate(() => ({ ...localStorage }));
  await page.screenshot({ path: `explore/cart-after-user-switch.png` });
  note('H05', { sameUserBadge, otherUserBadge_visual_user: otherUserBadge, localStorage: ls });
});

test.skip('H06 [superseded by followup.probe.js – waits 30s on absent badge]', async ({ page }) => {
  await login(page);
  await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
  await page.locator('[data-test="add-to-cart-sauce-labs-onesie"]').click();
  await page.getByRole('button', { name: 'Open Menu' }).click();
  await page.locator('[data-test="reset-sidebar-link"]').click();
  await page.getByRole('button', { name: 'Close Menu' }).click();
  const badge = await page.locator('[data-test="shopping-cart-badge"]').count();
  const removeButtons = await page.locator('button[data-test^="remove-"]').count();
  await page.screenshot({ path: `explore/reset-state-menu-open.png` });
  // what happens when the stale button is clicked?
  await page.locator('[data-test="remove-sauce-labs-backpack"]').click();
  const badgeAfterClick = await page.locator('[data-test="shopping-cart-badge"]').textContent().catch(() => null);
  await page.reload();
  const removeAfterReload = await page.locator('button[data-test^="remove-"]').count();
  note('H06', { badgeCountAfterReset: badge, removeButtonsAfterReset: removeButtons, badgeAfterClickingStaleRemove: badgeAfterClick, removeAfterReload });
});

test.skip('H07 [superseded by followup.probe.js – waits 30s on absent error]', async ({ page }) => {
  await login(page);
  await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
  const cases= {
    allEmpty: ['', '', ''],
    whitespaceOnly: ['   ', '   ', '   '],
    nonsensePostal: ['John', 'Doe', '!!@@##'],
    scriptInName: ['<img src=x onerror=alert(1)>', 'Doe', '12345'],
    veryLong: ['A'.repeat(500), 'B'.repeat(500), '9'.repeat(200)],
  };
  const out= {};
  for (const [k, [f, l, z]] of Object.entries(cases)) {
    await page.goto('/checkout-step-one.html');
    await page.locator('[data-test="firstName"]').fill(f);
    await page.locator('[data-test="lastName"]').fill(l);
    await page.locator('[data-test="postalCode"]').fill(z);
    await page.locator('[data-test="continue"]').click();
    out[k] = { path: new URL(page.url()).pathname, error: await page.locator('[data-test="error"]').textContent().catch(() => null) };
    if (k === 'whitespaceOnly') await page.screenshot({ path: `explore/whitespace-first-attempt.png`, fullPage: true });
  }
  note('H07', out);
});

test('H08 price/tax math on overview', async ({ page }) => {
  await login(page);
  const ids = ['sauce-labs-backpack', 'sauce-labs-bolt-t-shirt', 'sauce-labs-fleece-jacket'];
  for (const id of ids) await page.locator(`[data-test="add-to-cart-${id}"]`).click();
  await page.locator('[data-test="shopping-cart-link"]').click();
  await page.locator('[data-test="checkout"]').click();
  await page.locator('[data-test="firstName"]').fill('A');
  await page.locator('[data-test="lastName"]').fill('B');
  await page.locator('[data-test="postalCode"]').fill('1');
  await page.locator('[data-test="continue"]').click();
  const prices = (await page.locator('[data-test="inventory-item-price"]').allTextContents()).map(p => Number(p.replace('$', '')));
  const num = async (s) => Number(String(await page.locator(`[data-test="${s}"]`).textContent()).replace(/[^0-9.]/g, ''));
  const sub = await num('subtotal-label'), tax = await num('tax-label'), total = await num('total-label');
  note('H08', { prices, sum: +prices.reduce((a, b) => a + b, 0).toFixed(2), sub, tax, taxRate: +(tax / sub).toFixed(4), total, consistent: +(sub + tax).toFixed(2) === total });
});

test('H09 sorting correctness', async ({ page }) => {
  await login(page);
  const sel = page.locator('[data-test="product-sort-container"]');
  const out= {};
  for (const opt of ['az', 'za', 'lohi', 'hilo']) {
    await sel.selectOption(opt);
    const names = await page.locator('[data-test="inventory-item-name"]').allTextContents();
    const prices = (await page.locator('[data-test="inventory-item-price"]').allTextContents()).map(p => Number(p.slice(1)));
    const expNames = [...names].sort((a, b) => a.localeCompare(b));
    const expPrices = [...prices].sort((a, b) => a - b);
    const ok = opt === 'az' ? JSON.stringify(names) === JSON.stringify(expNames)
      : opt === 'za' ? JSON.stringify(names) === JSON.stringify([...expNames].reverse())
      : opt === 'lohi' ? JSON.stringify(prices) === JSON.stringify(expPrices)
      : JSON.stringify(prices) === JSON.stringify([...expPrices].reverse());
    out[opt] = { ok, first: names[0], firstPrice: prices[0] };
  }
  await page.goto('/cart.html');
  await page.goto('/inventory.html');
  out.sortRetainedAfterNavigation = await sel.inputValue();
  note('H09', out);
});

test('H10 accessibility basics', async ({ page }) => {
  await page.goto('/');
  const loginInputs = await page.evaluate(() => [...document.querySelectorAll('input')].map(i => ({
    id: i.id, type: i.type, hasLabel: !!(i.labels && i.labels.length) || !!i.getAttribute('aria-label') || !!i.getAttribute('aria-labelledby'),
    placeholder: i.placeholder })));
  const htmlLang = await page.evaluate(() => document.documentElement.lang);
  await login(page);
  const imgs = await page.evaluate(() => [...document.querySelectorAll('img.inventory_item_img')].map(i => i.getAttribute('alt')));
  const menuBtn = await page.getByRole('button', { name: 'Open Menu' }).count();
  const sortLabel = await page.evaluate(() => { const s = document.querySelector('select'); return s ? (!!s.labels?.length || !!s.getAttribute('aria-label')) : null; });
  // keyboard: can Tab reach the first add-to-cart button?
  await page.goto('/inventory.html');
  let reachedAdd = false;
  for (let i = 0; i < 15; i++) {
    await page.keyboard.press('Tab');
    const dt = await page.evaluate(() => document.activeElement?.getAttribute('data-test'));
    if (dt?.startsWith('add-to-cart')) { reachedAdd = true; break; }
  }
  await page.goto('/checkout-step-one.html');
  const checkoutInputs = await page.evaluate(() => [...document.querySelectorAll('input[type=text]')].map(i => ({
    id: i.id, hasLabel: !!(i.labels && i.labels.length) || !!i.getAttribute('aria-label') })));
  await page.screenshot({ path: `explore/checkout-inputs.png` });
  note('H10', { htmlLang, loginInputs, productImgAlts: imgs, menuBtnAccessibleName: menuBtn, sortHasLabel: sortLabel, keyboardReachesAddToCart: reachedAdd, checkoutInputs });
});

test('H11 responsive layout (mobile)', async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 375, height: 667 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  await login(page);
  const overflowX = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  await page.screenshot({ path: `explore/mobile-inventory.png` });
  note('H11', { horizontalOverflow: overflowX });
  await ctx.close();
});

test('H12 login messages + misc', async ({ page }) => {
  const msg = async (u, p) => {
    await page.goto('/');
    if (u) await page.locator('[data-test="username"]').fill(u);
    if (p) await page.locator('[data-test="password"]').fill(p);
    await page.locator('[data-test="login-button"]').click();
    return page.locator('[data-test="error"]').textContent().catch(() => null);
  };
  const out = {
    empty: await msg('', ''),
    noPassword: await msg('standard_user', ''),
    wrongPassword: await msg('standard_user', 'bad'),
    locked: await msg('locked_out_user', 'secret_sauce'),
    caseSensitiveUser: await msg('Standard_User', 'secret_sauce'),
    trailingSpaceUser: await msg('standard_user ', 'secret_sauce'),
    passwordFieldType: await page.locator('[data-test="password"]').getAttribute('type'),
  };
  await login(page);
  const footer = await page.locator('[data-test="footer-copy"]').textContent();
  // Cancel on overview: where does it go?
  await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
  await page.goto('/checkout-step-two.html');
  await page.locator('[data-test="cancel"]').click();
  const cancelFromOverview = new URL(page.url()).pathname;
  // product detail price matches list
  await page.goto('/inventory.html');
  const listPrice = await page.locator('[data-test="inventory-item-price"]').first().textContent();
  await page.locator('[data-test="inventory-item-name"]').first().click();
  const detailPrice = await page.locator('[data-test="inventory-item-price"]').textContent();
  await page.goto('/inventory-item.html?id=999');
  const invalidIdName = await page.locator('[data-test="inventory-item-name"]').textContent().catch(() => null);
  await page.screenshot({ path: 'explore/invalid-product-id.png' });
  const invalidIdAdd = await page.locator('button[data-test^="add-to-cart"]').isVisible().catch(() => false);
  note('H12', { ...out, footer, cancelFromOverview, listPrice, detailPrice, invalidIdName, invalidIdAddVisible: invalidIdAdd });
});

test('H13 seeded accounts comparison (not standard_user defects)', async ({ page }) => {
  const out= {};
  await login(page, 'problem_user');
  out.problem_user_distinctImages = new Set(await page.locator('img.inventory_item_img').evaluateAll(e => e.map(i => /** @type {HTMLImageElement} */ (i).src))).size;
  await page.locator('[data-test="product-sort-container"]').selectOption('za');
  out.problem_user_sortZA_first = await page.locator('[data-test="inventory-item-name"]').first().textContent();
  await page.context().clearCookies(); await page.evaluate(() => localStorage.clear());
  await login(page, 'error_user');
  await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
  await page.goto('/checkout-step-one.html');
  await page.locator('[data-test="firstName"]').fill('A');
  await page.locator('[data-test="lastName"]').fill('B');
  await page.locator('[data-test="postalCode"]').fill('1');
  await page.locator('[data-test="continue"]').click();
  await page.locator('[data-test="finish"]').click().catch(() => {});
  out.error_user_afterFinish = new URL(page.url()).pathname;
  await page.context().clearCookies(); await page.evaluate(() => localStorage.clear());
  const t0 = Date.now();
  await login(page, 'performance_glitch_user');
  await page.locator('[data-test="inventory-list"]').waitFor();
  out.performance_glitch_user_loginMs = Date.now() - t0;
  note('H13', out);
});
