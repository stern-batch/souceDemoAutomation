// @ts-check
// Each test asserts the CORRECT behaviour, so it fails (red) while the defect exists and passes once it is fixed.
// Run separately with `npm run test:defects`; `npm test` never includes this folder.
const { test, expect } = require('../fixtures');
const { users, products, customer } = require('../data/testData');

test('[D1] TC-18 an order cannot be placed with an empty cart', async ({ page, loggedIn: inventory, cartPage }) => {
  await inventory.header.openCart();
  await cartPage.expectLoaded();
  await expect(cartPage.lineItems).toHaveCount(0);

  if (await cartPage.checkoutButton.isEnabled()) await cartPage.checkoutButton.click();

  await expect(page, 'checkout must not start with an empty cart').not.toHaveURL(/checkout-step-one\.html/);
});

test('[D2] TC-16 checkout rejects customer details that contain only spaces', async ({
  loggedIn: inventory,
  checkoutInfoPage,
}) => {
  await inventory.addToCart(products.backpack);
  await checkoutInfoPage.goto();

  await checkoutInfoPage.submit({ firstName: '   ', lastName: '   ', postalCode: '   ' });

  await expect(checkoutInfoPage.error, 'spaces-only must be treated as empty').toHaveText('Error: First Name is required');
  await checkoutInfoPage.expectLoaded();
});

test('[D2] TC-17 customer information step cannot be skipped by URL', async ({ page, loggedIn: inventory }) => {
  await inventory.addToCart(products.backpack);

  await page.goto('/checkout-step-two.html');

  await expect(page, 'user must be sent back to Your Information').toHaveURL(/checkout-step-one\.html$/);
});

test('[D3] TC-05 cart is not carried over to a different user after logout', async ({
  loggedIn: inventory,
  loginPage,
  cartPage,
}) => {
  await inventory.addToCart(products.fleeceJacket);
  await inventory.header.logout();

  await loginPage.login(users.visual.username, users.visual.password);
  await inventory.expectLoaded();

  await expect.soft(inventory.header.cartBadge, 'second user must not see a cart badge').toBeHidden();
  await inventory.header.openCart();
  await cartPage.expectLoaded();
  await expect.soft(cartPage.lineItems, "second user's cart must be empty").toHaveCount(0);
});

test('[D4] TC-10 Reset App State clears the cart and resets all product buttons', async ({ loggedIn: inventory }) => {
  await inventory.addToCart(products.backpack);
  await inventory.addToCart(products.bikeLight);

  await inventory.header.resetAppState();

  await expect.soft(inventory.header.cartBadge, 'cart badge is cleared').toBeHidden();
  await expect.soft(inventory.removeButtons, 'no product may still show "Remove"').toHaveCount(0);
});

test('[D5] TC-08 a non-existent product cannot be added to the cart', async ({
  loggedIn: inventory,
  productDetailPage,
  cartPage,
  checkoutInfoPage,
  checkoutOverviewPage,
}) => {
  await productDetailPage.goto(999);

  await expect.soft(productDetailPage.addToCartButton, 'invalid product must not be purchasable').toHaveCount(0);
  if (await productDetailPage.addToCartButton.count()) await productDetailPage.addToCartButton.click();

  await inventory.header.openCart();
  await cartPage.expectLoaded();
  const badgeText = (await inventory.header.cartBadge.count()) ? await inventory.header.cartBadge.textContent() : '0';
  expect.soft(Number(badgeText), 'badge count must match the items listed in the cart').toBe(await cartPage.lineItems.count());

  await cartPage.checkout();
  await checkoutInfoPage.submit(customer);
  await expect.soft(checkoutOverviewPage.title, 'checkout overview must render').toHaveText('Checkout: Overview');
});
