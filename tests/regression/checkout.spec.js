// @ts-check
const { test, expect } = require('../fixtures');
const { products, customer } = require('../data/testData');

test('TC-12 totals are correct for three products', async ({
  loggedIn: inventory,
  cartPage,
  checkoutInfoPage,
  checkoutOverviewPage,
}) => {
  for (const name of [products.backpack, products.boltTShirt, products.fleeceJacket]) {
    await inventory.addToCart(name);
  }
  await inventory.header.openCart();
  await cartPage.expectLoaded();
  await cartPage.checkout();
  await checkoutInfoPage.submit(customer);
  await checkoutOverviewPage.expectLoaded();
  await expect(checkoutOverviewPage.lineItems).toHaveCount(3);

  const { subtotalCents, taxCents, totalCents } = await checkoutOverviewPage.readSummary();
  expect(subtotalCents, 'item total $95.97').toBe(9597);
  expect(taxCents, 'tax $7.68').toBe(768);
  expect(totalCents, 'total $103.65').toBe(10365);
});
