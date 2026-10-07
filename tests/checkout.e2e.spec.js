// @ts-check
const { test, expect } = require('./fixtures');
const { products, customer, TAX_RATE } = require('./data/testData');

test.describe('Purchase journey – standard_user', () => {
  test('user can buy two products and totals are calculated correctly @smoke', async ({
    loggedIn: inventory,
    cartPage,
    checkoutInfoPage,
    checkoutOverviewPage,
    checkoutCompletePage,
  }) => {
    const chosen = [products.backpack, products.fleeceJacket];

    /** @type {import('../pages/CartPage').LineItem[]} */
    const expectedItems = [];
    for (const name of chosen) {
      expectedItems.push({ name, priceCents: await inventory.priceInCents(name), quantity: 1 });
      await inventory.addToCart(name);
    }
    await expect(inventory.header.cartBadge).toHaveText(String(chosen.length));

    await test.step('cart shows exactly the selected products at catalogue prices', async () => {
      await inventory.header.openCart();
      await cartPage.expectLoaded();
      await expect(cartPage.lineItems).toHaveCount(chosen.length);
      expect(await cartPage.readItems()).toEqual(expectedItems);
    });

    await test.step('customer information is accepted', async () => {
      await cartPage.checkout();
      await checkoutInfoPage.expectLoaded();
      await checkoutInfoPage.submit(customer);
    });

    await test.step('overview lists the same items and totals are consistent', async () => {
      await checkoutOverviewPage.expectLoaded();
      await expect(checkoutOverviewPage.lineItems).toHaveCount(chosen.length);
      expect(await checkoutOverviewPage.readItems()).toEqual(expectedItems);

      const { subtotalCents, taxCents, totalCents } = await checkoutOverviewPage.readSummary();
      const expectedSubtotal = expectedItems.reduce((sum, i) => sum + i.priceCents * i.quantity, 0);
      expect(subtotalCents, 'item total = sum of line prices').toBe(expectedSubtotal);
      expect(taxCents, `tax = ${TAX_RATE * 100}% of item total`).toBe(Math.round(expectedSubtotal * TAX_RATE));
      expect(totalCents, 'total = item total + tax').toBe(subtotalCents + taxCents);
    });

    await test.step('order is confirmed and the cart is emptied', async () => {
      await checkoutOverviewPage.finish();
      await checkoutCompletePage.expectOrderConfirmed();
      await expect(inventory.header.cartBadge).toBeHidden();

      await checkoutCompletePage.backHome();
      await inventory.expectLoaded();
      await expect(inventory.items.getByRole('button', { name: 'Remove' })).toHaveCount(0);
      await inventory.header.openCart();
      await expect(cartPage.lineItems).toHaveCount(0);
    });
  });
});
