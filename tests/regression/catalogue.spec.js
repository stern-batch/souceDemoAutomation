// @ts-check
const { test, expect } = require('../fixtures');
const { products } = require('../data/testData');

test.describe('TC-06 Products can be sorted by name and price', () => {
  test('TC-06 Name (A to Z)', async ({ loggedIn: inventory }) => {
    await inventory.sortBy('az');
    const names = await inventory.names();
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
    expect(names[0]).toBe(products.backpack);
  });

  test('TC-06 Name (Z to A)', async ({ loggedIn: inventory }) => {
    await inventory.sortBy('za');
    const names = await inventory.names();
    expect(names).toEqual([...names].sort((a, b) => b.localeCompare(a)));
    expect(names[0]).toBe(products.redTShirt);
  });

  test('TC-06 Price (low to high)', async ({ loggedIn: inventory }) => {
    await inventory.sortBy('lohi');
    const prices = await inventory.pricesInCents();
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
    expect(await inventory.itemNames.first().textContent()).toBe(products.onesie);
    expect(prices[0]).toBe(799);
  });

  test('TC-06 Price (high to low)', async ({ loggedIn: inventory }) => {
    await inventory.sortBy('hilo');
    const prices = await inventory.pricesInCents();
    expect(prices).toEqual([...prices].sort((a, b) => b - a));
    expect(await inventory.itemNames.first().textContent()).toBe(products.fleeceJacket);
    expect(prices[0]).toBe(4999);
  });
});

test('TC-07 product price is the same on the list and the detail page', async ({ loggedIn: inventory, productDetailPage }) => {
  const listPrice = await inventory.priceInCents(products.backpack);

  await inventory.openProduct(products.backpack);

  await expect(productDetailPage.name).toHaveText(products.backpack);
  expect(await productDetailPage.priceInCents()).toBe(listPrice);
  expect(listPrice).toBe(2999);
});

test.describe('TC-09 mobile layout', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('TC-09 Products page fits a 375px screen without horizontal scrolling', async ({ page, loggedIn: inventory }) => {
    await expect(inventory.items).toHaveCount(6);
    const { scrollWidth, viewportWidth } = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      viewportWidth: window.innerWidth,
    }));
    expect(scrollWidth).toBeLessThanOrEqual(viewportWidth);
  });
});
